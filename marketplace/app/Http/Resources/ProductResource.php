<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return ['id' => $this->id, 'product_code' => $this->product_code, 'name' => $this->name, 'variant' => $this->variant, 'price' => (float) $this->price, 'stock' => $this->stock];
    }
}
