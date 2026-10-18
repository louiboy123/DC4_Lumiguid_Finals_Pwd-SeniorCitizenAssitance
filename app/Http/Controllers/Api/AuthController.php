<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BeneficiaryProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
            'beneficiary_type' => 'required|in:pwd,senior_citizen',
            'id_number' => 'required|string|max:255|unique:beneficiary_profiles,id_number',
            'birth_date' => 'required|date|before_or_equal:today',
            'address' => 'required|string|max:1000',
            'contact_number' => 'required|string|max:255',
            'disability_type' => 'nullable|string|max:255',
        ]);

        $user = DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => 'beneficiary',
            ]);

            BeneficiaryProfile::create([
                'user_id' => $user->id,
                'beneficiary_type' => $data['beneficiary_type'],
                'id_number' => $data['id_number'],
                'birth_date' => $data['birth_date'],
                'address' => $data['address'],
                'contact_number' => $data['contact_number'],
                'disability_type' => $data['disability_type'] ?? null,
            ]);

            return $user;
        });

        $token = $user->createToken('portal')->plainTextToken;

        return response()->json([
            'user' => $user->load('profile'),
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $user->tokens()->delete();

        $token = $user->createToken('portal')->plainTextToken;

        return response()->json([
            'user' => $user->load('profile'),
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user()->load('profile'));
    }
}
