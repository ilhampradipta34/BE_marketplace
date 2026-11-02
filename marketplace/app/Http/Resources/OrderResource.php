<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return ['id' => $this->id, 'order_number' => $this->order_number, 'status' => $this->status, 'customer' => new CustomerResource($this->whenLoaded('customer')), 'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($i) => ['product_id' => $i->product_id, 'product_name' => $i->product?->name, 'quantity' => $i->quantity, 'unit_price' => (float) $i->unit_price, 'subtotal' => (float) $i->subtotal])), 'total' => (float) $this->total, 'created_at' => $this->created_at?->toISOString()];
    }
}
