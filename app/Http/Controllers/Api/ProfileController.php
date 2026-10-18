<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BeneficiaryProfile;
use App\Models\User;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        return response()->json($request->user()->load('profile'));
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,'.$user->id,
            'beneficiary_type' => 'sometimes|in:pwd,senior_citizen',
            'id_number' => 'sometimes|string|max:255|unique:beneficiary_profiles,id_number,'.$user->profile?->id,
            'birth_date' => 'sometimes|date',
            'address' => 'sometimes|string',
            'contact_number' => 'sometimes|string|max:255',
            'disability_type' => 'sometimes|string|max:255',
        ]);

        $user->update($request->only(['name', 'email']));

        if ($user->profile) {
            $user->profile->update($request->only([
                'beneficiary_type', 'id_number', 'birth_date', 'address', 'contact_number', 'disability_type',
            ]));
        } else {
            BeneficiaryProfile::create(array_merge($request->only([
                'beneficiary_type', 'id_number', 'birth_date', 'address', 'contact_number', 'disability_type',
            ]), ['user_id' => $user->id]));
        }

        return response()->json($user->load('profile'));
    }
}
