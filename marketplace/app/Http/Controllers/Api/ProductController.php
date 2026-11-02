<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends ApiController
{
    public function index(Request $r)
    {
        $per = min(100, max(1, (int) $r->query('per_page', 10)));
        $q = Product::query()->when($r->query('search'), fn ($q, $s) => $q->where(fn ($q) => $q->whereRaw('LOWER(name) LIKE ?', ['%'.mb_strtolower($s).'%'])->orWhereRaw('LOWER(product_code) LIKE ?', ['%'.mb_strtolower($s).'%'])));
        $p = $q->orderBy('id')->paginate($per);

        return $this->ok(ProductResource::collection($p)->resolve(), 'OK', 200, ['page' => $p->currentPage(), 'per_page' => $p->perPage(), 'total' => $p->total()]);
    }

    public function store(StoreProductRequest $r)
    {
        return $this->ok(new ProductResource(Product::create($r->validated())), 'Produk dibuat', 201);
    }

    public function update(StoreProductRequest $r, int $id)
    {
        $p = Product::findOrFail($id);
        $p->update($r->validated());

        return $this->ok(new ProductResource($p), 'Produk diperbarui');
    }
}
