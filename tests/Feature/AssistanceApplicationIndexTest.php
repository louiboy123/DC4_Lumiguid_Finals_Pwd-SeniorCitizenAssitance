<?php

namespace Tests\Feature;

use App\Models\AssistanceApplication;
use App\Models\AssistanceProgram;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AssistanceApplicationIndexTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_application_list_returns_data_and_pagination_metadata(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $beneficiary = User::factory()->create(['role' => 'beneficiary']);
        $program = AssistanceProgram::create([
            'name' => 'Medical Assistance',
            'description' => 'Medical support',
            'eligibility' => 'Registered beneficiary',
            'is_open' => true,
        ]);
        AssistanceApplication::create([
            'application_number' => 'APP-20261018-TEST01',
            'user_id' => $beneficiary->id,
            'assistance_program_id' => $program->id,
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        Sanctum::actingAs($admin);

        $this->getJson('/api/applications')
            ->assertOk()
            ->assertJsonPath('data.0.application_number', 'APP-20261018-TEST01')
            ->assertJsonPath('meta.current_page', 1)
            ->assertJsonPath('meta.last_page', 1)
            ->assertJsonPath('meta.total', 1);
    }
}
