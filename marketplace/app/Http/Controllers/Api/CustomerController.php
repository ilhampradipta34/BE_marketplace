<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreCustomerRequest;
use App\Http\Resources\CustomerResource;
use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerController extends ApiController
{
    public function index(Request $r)
    {
        $p = Customer::orderBy('id')->paginate(min(100, max(1, (int) $r->query('per_page', 10))));

        return $this->ok(CustomerResource::collection($p)->resolve(), 'OK', 200, ['page' => $p->currentPage(), 'per_page' => $p->perPage(), 'total' => $p->total()]);
    }

    public function store(StoreCustomerRequest $r)
    {
        return $this->transaction(function () use ($r) {
            $customer = Customer::create($r->validated());

            return $this->ok(new CustomerResource($customer), 'Pelanggan dibuat', 201);
        });
    }
}
