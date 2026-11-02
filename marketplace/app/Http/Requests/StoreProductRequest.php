<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('id');

        return ['product_code' => ['required', 'string', 'max:80', Rule::unique('products', 'product_code')->ignore($id)], 'name' => ['required', 'string', 'max:255'], 'variant' => ['nullable', 'string', 'max:100'], 'price' => ['required', 'numeric', 'gt:0'], 'stock' => ['required', 'integer', 'min:0']];
    }
}
