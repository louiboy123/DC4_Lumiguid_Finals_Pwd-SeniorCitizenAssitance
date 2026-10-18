<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthRegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_creates_user_profile_and_token(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Jamie Rivera',
            'email' => 'jamie@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'beneficiary_type' => 'pwd',
            'id_number' => 'PWD-1001',
            'birth_date' => '1990-05-14',
            'address' => 'Barangay Central',
            'contact_number' => '09171234567',
            'disability_type' => 'Visual',
        ]);

        $response->assertCreated()
            ->assertJsonPath('user.role', 'beneficiary')
            ->assertJsonPath('user.profile.beneficiary_type', 'pwd')
            ->assertJsonPath('user.profile.id_number', 'PWD-1001')
            ->assertJsonStructure(['token', 'user' => ['id', 'profile' => ['birth_date', 'address', 'contact_number']]]);

        $this->assertDatabaseHas('beneficiary_profiles', [
            'id_number' => 'PWD-1001',
            'beneficiary_type' => 'pwd',
        ]);
    }

    public function test_registration_requires_beneficiary_profile_fields(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Jamie Rivera',
            'email' => 'jamie@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertUnprocessable()
            ->assertInvalid(['beneficiary_type', 'id_number', 'birth_date', 'address', 'contact_number']);

        $this->assertDatabaseMissing('users', ['email' => 'jamie@example.com']);
    }
}
