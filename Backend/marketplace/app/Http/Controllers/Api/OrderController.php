<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class OrderController extends ApiController
{
    public function index(Request $request)
    {
        $perPage = min(
            100,
            max(1, (int) $request->query('per_page', 10))
        );

        $orders = Order::with('customer', 'items.product')
            ->when(
                $request->status,
                fn ($orderQuery, $status) =>
                    $orderQuery->where('status', $status)
            )
            ->when(
                $request->from,
                fn ($orderQuery, $fromDate) =>
                    $orderQuery->whereDate('created_at', '>=', $fromDate)
            )
            ->when(
                $request->to,
                fn ($orderQuery, $toDate) =>
                    $orderQuery->whereDate('created_at', '<=', $toDate)
            )
            ->latest()
            ->paginate($perPage);

        return $this->ok(
            OrderResource::collection($orders)->resolve(),
            'OK',
            200,
            [
                'page' => $orders->currentPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ]
        );
    }

    public function show(int $id)
    {
        $order = Order::with('customer', 'items.product')
            ->findOrFail($id);

        return $this->ok(
            new OrderResource($order)
        );
    }

    public function store(StoreOrderRequest $request)
    {
        $data = $request->validated();

        $order = $this->transaction(function () use ($data, $request) {

            // Find customer and lock the row
            $customer = Customer::whereKey($data['customer_id'])
                ->lockForUpdate()
                ->firstOrFail();

            // Check pending orders
            $pending = $customer->orders()
                ->where('status', 'PENDING')
                ->count();

            if ($pending >= 3) {
                throw ValidationException::withMessages([
                    'customer_id' => [
                        'Pelanggan maksimal memiliki 3 order PENDING.',
                    ],
                ]);
            }

            // Get product IDs and sort them
            $ids = collect($data['items'])
                ->pluck('product_id')
                ->sort()
                ->values();

            // Find products and lock rows
            $products = Product::whereIn('id', $ids)
                ->orderBy('id')
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            // Validate product quantities and stock
            $errors = [];

            foreach ($data['items'] as $i => $item) {
                $product = $products[$item['product_id']];

                if ($item['quantity'] > 5) {
                    $errors["items.$i.quantity"][] =
                        'Maksimal 5 unit per produk dalam satu order.';
                }

                if ($product->stock < $item['quantity']) {
                    $errors["items.$i.quantity"][] =
                        "Stok {$product->name} tersisa {$product->stock}, diminta {$item['quantity']}";
                }
            }

            if ($errors) {
                throw ValidationException::withMessages($errors);
            }

            // Calculate total order
            $total = 0;

            foreach ($data['items'] as $item) {
                $product = $products[$item['product_id']];

                $total += (float) $product->price * $item['quantity'];
            }

            // Generate unique invoice number
            do {
                $number = 'INV-'
                    . now()->format('Ymd')
                    . '-'
                    . str_pad(
                        (string) random_int(0, 9999),
                        4,
                        '0',
                        STR_PAD_LEFT
                    );

            } while (
                Order::where('order_number', $number)->exists()
            );

            // Create order
            $order = Order::create([
                'order_number' => $number,
                'customer_id' => $customer->id,
                'user_id' => $request->user()->id,
                'status' => 'PENDING',
                'total' => $total,
            ]);

            // Create order items and reduce stock
            foreach ($data['items'] as $item) {
                $product = $products[$item['product_id']];

                $product->decrement('stock', $item['quantity']);

                $order->items()->create([
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $product->price,
                    'subtotal' => (float) $product->price
                        * $item['quantity'],
                ]);
            }

            return $order->load('customer', 'items.product');
        });

        return $this->ok(
            new OrderResource($order),
            'Order dibuat',
            201
        );
    }

    public function pay(int $id)
    {
        return $this->changeStatus($id, 'PAID');
    }

    public function cancel(int $id)
    {
        return $this->transaction(function () use ($id) {

            $order = Order::with('items')
                ->lockForUpdate()
                ->findOrFail($id);

            if (! in_array($order->status, ['PENDING', 'PAID'])) {
                return response()->json(
                    [
                        'success' => false,
                        'message' => 'Transisi status order tidak valid',
                    ],
                    409
                );
            }

            // Restore product stock
            foreach ($order->items as $item) {
                Product::whereKey($item->product_id)
                    ->lockForUpdate()
                    ->firstOrFail()
                    ->increment('stock', $item->quantity);
            }

            // Update order status
            $order->update([
                'status' => 'CANCELLED',
            ]);

            return $this->ok(
                new OrderResource(
                    $order->fresh()->load('customer', 'items.product')
                ),
                'Order dibatalkan'
            );
        });
    }

    private function changeStatus(int $id, string $status)
    {
        return $this->transaction(function () use ($id, $status) {

            $order = Order::whereKey($id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($order->status !== 'PENDING') {
                return response()->json(
                    [
                        'success' => false,
                        'message' => 'Transisi status order tidak valid',
                    ],
                    409
                );
            }

            $order->update([
                'status' => $status,
            ]);

            return $this->ok(
                new OrderResource(
                    $order->load('customer', 'items.product')
                ),
                'Status order diperbarui'
            );
        });
    }
}
