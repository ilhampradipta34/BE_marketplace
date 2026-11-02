<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Product> */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        return ['product_code' => 'PRD-'.$this->faker->unique()->bothify('####'), 'name' => $this->faker->words(2, true), 'variant' => $this->faker->randomElement(['150ml', '250ml', '500ml']), 'price' => $this->faker->randomFloat(2, 1000, 100000), 'stock' => $this->faker->numberBetween(0, 100)];
    }
}
