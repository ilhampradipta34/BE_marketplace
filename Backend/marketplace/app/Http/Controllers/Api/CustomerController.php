<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreCustomerRequest;
use App\Http\Resources\CustomerResource;
use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerController extends ApiController
{
     public function index(Request $request)
    {
        $perPage = min(
            100,
            max(1, (int) $request->query('per_page', 10))
        );

        $customers = Customer::orderBy('id')
            ->paginate($perPage);

        return $this->ok(
            CustomerResource::collection($customers)->resolve(),
            'OK',
            200,
            [
                'page' => $customers->currentPage(),
                'per_page' => $customers->perPage(),
                'total' => $customers->total(),
            ]
        );
    }

    public function store(StoreCustomerRequest $request)
    {
        return $this->transaction(function () use ($request) {
            $customer = Customer::create(
                $request->validated()
            );

            return $this->ok(
                new CustomerResource($customer),
                'Pelanggan dibuat',
                201
            );
        });
    }
}
