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
        $orders = Order::with('customer', 'items.product')
            ->when($request->status, fn ($orderQuery, $status) => $orderQuery->where('status', $status))
            ->when($request->from, fn ($orderQuery, $fromDate) => $orderQuery->whereDate('created_at', '>=', $fromDate))
            ->when($request->to, fn ($orderQuery, $toDate) => $orderQuery->whereDate('created_at', '<=', $toDate))
            ->latest()
            ->paginate(min(100, max(1, (int) $request->query('per_page', 10))));

        return $this->ok(OrderResource::collection($orders)->resolve(), 'OK', 200, ['page' => $orders->currentPage(), 'per_page' => $orders->perPage(), 'total' => $orders->total()]);
    }

    public function show(int $id)
    {
        return $this->ok(new OrderResource(Order::with('customer', 'items.product')->findOrFail($id)));
    }

    public function store(StoreOrderRequest $request)
    {
        $data = $request->validated();
        $order = $this->transaction(function () use ($data, $request) {
            $customer = Customer::whereKey($data['customer_id'])->lockForUpdate()->firstOrFail();
            $pending = $customer->orders()->where('status', 'PENDING')->count();
            if ($pending >= 3) {
                throw ValidationException::withMessages(['customer_id' => ['Pelanggan maksimal memiliki 3 order PENDING.']]);
            } $ids = collect($data['items'])->pluck('product_id')->sort()->values();
            $products = Product::whereIn('id', $ids)->orderBy('id')->lockForUpdate()->get()->keyBy('id');
            $errors = [];
            foreach ($data['items'] as $i => $item) {
                $p = $products[$item['product_id']];
                if ($item['quantity'] > 5) {
                    $errors["items.$i.quantity"][] = 'Maksimal 5 unit per produk dalam satu order.';
                } if ($p->stock < $item['quantity']) {
                    $errors["items.$i.quantity"][] = "Stok {$p->name} tersisa {$p->stock}, diminta {$item['quantity']}";
                }
            } if ($errors) {
                throw ValidationException::withMessages($errors);
            } $total = 0;
            foreach ($data['items'] as $i => $item) {
                $total += (float) $products[$item['product_id']]->price * $item['quantity'];
            } do {
                $number = 'INV-'.now()->format('Ymd').'-'.str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT);
            } while (Order::where('order_number', $number)->exists());
            $order = Order::create(['order_number' => $number, 'customer_id' => $customer->id, 'user_id' => $request->user()->id, 'status' => 'PENDING', 'total' => $total]);
            foreach ($data['items'] as $item) {
                $p = $products[$item['product_id']];
                $p->decrement('stock', $item['quantity']);
                $order->items()->create(['product_id' => $p->id, 'quantity' => $item['quantity'], 'unit_price' => $p->price, 'subtotal' => (float) $p->price * $item['quantity']]);
            }

            return $order->load('customer', 'items.product');
        });

        return $this->ok(new OrderResource($order), 'Order dibuat', 201);
    }

    public function pay(int $id)
    {
        return $this->changeStatus($id, 'PAID');
    }

    public function cancel(int $id)
    {
        return $this->transaction(function () use ($id) {
            $o = Order::with('items')->lockForUpdate()->findOrFail($id);
            if (! in_array($o->status, ['PENDING', 'PAID'])) {
                return response()->json(['success' => false, 'message' => 'Transisi status order tidak valid'], 409);
            } foreach ($o->items as $item) {
                Product::whereKey($item->product_id)->lockForUpdate()->firstOrFail()->increment('stock', $item->quantity);
            } $o->update(['status' => 'CANCELLED']);

            return $this->ok(new OrderResource($o->fresh()->load('customer', 'items.product')), 'Order dibatalkan');
        });
    }

    private function changeStatus(int $id, string $status)
    {
        return $this->transaction(function () use ($id, $status) {
            $o = Order::whereKey($id)->lockForUpdate()->firstOrFail();
            if ($o->status !== 'PENDING') {
                return response()->json(['success' => false, 'message' => 'Transisi status order tidak valid'], 409);
            } $o->update(['status' => $status]);

            return $this->ok(new OrderResource($o->load('customer', 'items.product')), 'Status order diperbarui');
        });
    }
}
