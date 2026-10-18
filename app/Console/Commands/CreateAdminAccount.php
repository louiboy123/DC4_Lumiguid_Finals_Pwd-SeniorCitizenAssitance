<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

#[Signature('app:make-admin {email : The email address of the administrator account}')]
#[Description('Create an administrator account or promote an existing account')]
class CreateAdminAccount extends Command
{
    public function handle(): int
    {
        $email = trim((string) $this->argument('email'));
        $emailValidator = Validator::make(['email' => $email], [
            'email' => ['required', 'email'],
        ]);

        if ($emailValidator->fails()) {
            foreach ($emailValidator->errors()->all() as $error) {
                $this->error($error);
            }

            return self::FAILURE;
        }

        $user = User::where('email', $email)->first();

        if ($user !== null) {
            if ($user->role === 'admin') {
                $this->info("{$email} already has admin access.");

                return self::SUCCESS;
            }

            if (! $this->confirm("Grant admin access to {$email}?", false)) {
                $this->info('No changes made.');

                return self::SUCCESS;
            }

            $user->role = 'admin';
            $user->save();

            $this->info("Admin access granted to {$email}.");

            return self::SUCCESS;
        }

        $name = trim((string) $this->ask('Name'));
        $password = $this->secret('Password (minimum 12 characters)');
        $passwordConfirmation = $this->secret('Confirm password');

        $accountValidator = Validator::make([
            'name' => $name,
            'password' => $password,
            'password_confirmation' => $passwordConfirmation,
        ], [
            'name' => ['required', 'string', 'max:255'],
            'password' => ['required', 'string', 'confirmed', Password::min(12)->max(256)],
        ]);

        if ($accountValidator->fails()) {
            foreach ($accountValidator->errors()->all() as $error) {
                $this->error($error);
            }

            return self::FAILURE;
        }

        if (! $this->confirm("Create administrator account for {$email}?", false)) {
            $this->info('No changes made.');

            return self::SUCCESS;
        }

        User::create([
            'name' => $name,
            'email' => $email,
            'password' => $password,
            'role' => 'admin',
        ]);

        $this->info("Admin account created for {$email}.");

        return self::SUCCESS;
    }
}
