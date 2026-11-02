<?php

use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function apiAdmin(): User
{
    return User::factory()->create();
}
function setupOrderData(int $stock = 10): array
{
    return [Customer::factory()->create(), Product::factory()->create(['stock' => $stock, 'price' => 12000])];
}

it('creates an order and calculates totals on the server', function () {
    [$c,$p] = setupOrderData();
    $this->actingAs(apiAdmin())->postJson('/api/orders', ['customer_id' => $c->id, 'items' => [['product_id' => $p->id, 'quantity' => 2, 'unit_price' => 1]]])->assertCreated()->assertJsonPath('data.total', 24000);
    expect($p->fresh()->stock)->toBe(8);
});
it('rejects insufficient stock without changing inventory', function () {
    [$c,$p] = setupOrderData(1);
    $this->actingAs(apiAdmin())->postJson('/api/orders', ['customer_id' => $c->id, 'items' => [['product_id' => $p->id, 'quantity' => 2]]])->assertUnprocessable();
    expect($p->fresh()->stock)->toBe(1);
    expect(Order::count())->toBe(0);
});
it('restores inventory when an order is cancelled', function () {
    [$c,$p] = setupOrderData();
    $o = Order::create(['order_number' => 'INV-20261102-0001', 'customer_id' => $c->id, 'user_id' => apiAdmin()->id, 'status' => 'PENDING', 'total' => 12000]);
    $o->items()->create(['product_id' => $p->id, 'quantity' => 2, 'unit_price' => 12000, 'subtotal' => 24000]);
    $p->decrement('stock', 2);
    $this->actingAs(apiAdmin())->patchJson("/api/orders/{$o->id}/cancel")->assertOk();
    expect($p->fresh()->stock)->toBe(10);
});
it('rejects invalid status transitions with conflict', function () {
    [$c,$p] = setupOrderData();
    $o = Order::create(['order_number' => 'INV-20261102-0002', 'customer_id' => $c->id, 'user_id' => apiAdmin()->id, 'status' => 'CANCELLED', 'total' => 1]);
    $this->actingAs(apiAdmin())->patchJson("/api/orders/{$o->id}/pay")->assertConflict();
});
it('enforces the five unit order limit', function () {
    [$c,$p] = setupOrderData(10);
    $this->actingAs(apiAdmin())->postJson('/api/orders', ['customer_id' => $c->id, 'items' => [['product_id' => $p->id, 'quantity' => 6]]])->assertUnprocessable();
    expect($p->fresh()->stock)->toBe(10);
});
it('requires a token on protected endpoints', function () {
    $this->getJson('/api/products')->assertUnauthorized();
});
it('limits each customer to three pending orders', function () {
    [$c,$p] = setupOrderData(100);
    $u = apiAdmin();
    foreach (range(1, 3) as $i) {
        $o = Order::create(['order_number' => sprintf('INV-20261102-%04d', $i), 'customer_id' => $c->id, 'user_id' => $u->id, 'status' => 'PENDING', 'total' => 1]);
    } $this->actingAs($u)->postJson('/api/orders', ['customer_id' => $c->id, 'items' => [['product_id' => $p->id, 'quantity' => 1]]])->assertUnprocessable();
});
