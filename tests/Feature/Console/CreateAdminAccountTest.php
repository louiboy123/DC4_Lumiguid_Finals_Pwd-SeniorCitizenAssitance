<?php

namespace Tests\Feature\Console;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CreateAdminAccountTest extends TestCase
{
    use RefreshDatabase;

    public function test_creates_admin_account_with_confirmed_local_password(): void
    {
        $email = 'marklouilumiguid14@gmail.com';
        $password = 'A-Long-Unique-Admin-Password-2026';

        $this->artisan('app:make-admin', ['email' => $email])
            ->expectsQuestion('Name', 'Mark Loui')
            ->expectsQuestion('Password (minimum 12 characters)', $password)
            ->expectsQuestion('Confirm password', $password)
            ->expectsConfirmation("Create administrator account for {$email}?", 'yes')
            ->assertExitCode(0);

        $user = User::where('email', $email)->firstOrFail();

        $this->assertSame('admin', $user->role);
        $this->assertTrue(Hash::check($password, $user->password));
    }

    public function test_promotes_existing_user_without_changing_their_password(): void
    {
        $email = 'marklouilumiguid14@gmail.com';
        $user = User::factory()->create([
            'email' => $email,
            'role' => 'beneficiary',
        ]);
        $originalPasswordHash = $user->password;

        $this->artisan('app:make-admin', ['email' => $email])
            ->expectsConfirmation("Grant admin access to {$email}?", 'yes')
            ->assertExitCode(0);

        $promotedUser = $user->fresh();

        $this->assertSame('admin', $promotedUser->role);
        $this->assertSame($originalPasswordHash, $promotedUser->password);
    }

    public function test_does_not_create_account_when_creation_is_declined(): void
    {
        $email = 'marklouilumiguid14@gmail.com';
        $password = 'A-Long-Unique-Admin-Password-2026';

        $this->artisan('app:make-admin', ['email' => $email])
            ->expectsQuestion('Name', 'Mark Loui')
            ->expectsQuestion('Password (minimum 12 characters)', $password)
            ->expectsQuestion('Confirm password', $password)
            ->expectsConfirmation("Create administrator account for {$email}?", 'no')
            ->assertExitCode(0);

        $this->assertDatabaseMissing('users', ['email' => $email]);
    }

    public function test_does_not_promote_existing_user_when_promotion_is_declined(): void
    {
        $email = 'marklouilumiguid14@gmail.com';
        $user = User::factory()->create([
            'email' => $email,
            'role' => 'beneficiary',
        ]);

        $this->artisan('app:make-admin', ['email' => $email])
            ->expectsConfirmation("Grant admin access to {$email}?", 'no')
            ->assertExitCode(0);

        $this->assertSame('beneficiary', $user->fresh()->role);
    }

    public function test_rejects_invalid_email_without_creating_an_account(): void
    {
        $this->artisan('app:make-admin', ['email' => 'not-an-email'])
            ->expectsOutputToContain('The email field must be a valid email address.')
            ->assertExitCode(1);

        $this->assertDatabaseCount('users', 0);
    }

    public function test_rejects_short_password_without_creating_an_account(): void
    {
        $email = 'marklouilumiguid14@gmail.com';

        $this->artisan('app:make-admin', ['email' => $email])
            ->expectsQuestion('Name', 'Mark Loui')
            ->expectsQuestion('Password (minimum 12 characters)', 'short')
            ->expectsQuestion('Confirm password', 'short')
            ->expectsOutputToContain('The password field must be at least 12 characters.')
            ->assertExitCode(1);

        $this->assertDatabaseMissing('users', ['email' => $email]);
    }
}
