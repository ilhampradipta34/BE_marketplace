<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\LoginRequest;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends ApiController
{
    public function login(LoginRequest $request)
    {
        $user = User::where('email', $request->email)->first();
        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json(['success' => false, 'message' => 'Email atau password salah', 'errors' => ['email' => ['Kredensial tidak valid']]], 401);
        }

        $token = $this->transaction(fn () => $user->createToken('api')->plainTextToken);

        return $this->ok(['token' => $token, 'token_type' => 'Bearer', 'user' => ['id' => $user->id, 'name' => $user->name, 'email' => $user->email]], 'Login berhasil');
    }
}
