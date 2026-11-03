<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends ApiController
{
    public function index(Request $request)
    {
        $perPage = min(
            100,
            max(1, (int) $request->query('per_page', 10))
        );

        $search = $request->query('search');

        $products = Product::query()
            ->when(
                $search,
                fn ($productQuery, $searchTerm) =>
                    $productQuery->where(
                        fn ($productQuery) => $productQuery
                            ->whereRaw(
                                'LOWER(name) LIKE ?',
                                ['%' . mb_strtolower($searchTerm) . '%']
                            )
                            ->orWhereRaw(
                                'LOWER(product_code) LIKE ?',
                                ['%' . mb_strtolower($searchTerm) . '%']
                            )
                    )
            )
            ->orderBy('id')
            ->paginate($perPage);

        return $this->ok(
            ProductResource::collection($products)->resolve(),
            'OK',
            200,
            [
                'page' => $products->currentPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ]
        );
    }

    public function store(StoreProductRequest $request)
    {
        return $this->transaction(function () use ($request) {
            $product = Product::create(
                $request->validated()
            );

            return $this->ok(
                new ProductResource($product),
                'Produk dibuat',
                201
            );
        });
    }

    public function update(StoreProductRequest $request, int $id)
    {
        return $this->transaction(function () use ($request, $id) {
            $product = Product::findOrFail($id);

            $product->update(
                $request->validated()
            );

            return $this->ok(
                new ProductResource($product),
                'Produk diperbarui'
            );
        });
    }   
}
