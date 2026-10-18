<?php

namespace Tests\Feature;

use App\Models\AssistanceProgram;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AssistanceProgramTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_program_list_returns_pagination_metadata_and_search_results(): void
    {
        AssistanceProgram::create([
            'name' => 'Medical Assistance',
            'description' => 'Support for medical costs',
            'eligibility' => 'Registered beneficiaries',
            'is_open' => true,
        ]);
        AssistanceProgram::create([
            'name' => 'Senior Citizen Pension',
            'description' => 'Quarterly pension',
            'eligibility' => 'Senior citizens',
            'is_open' => false,
        ]);
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));

        $this->getJson('/api/programs?search=medical')
            ->assertOk()
            ->assertJsonPath('data.0.name', 'Medical Assistance')
            ->assertJsonPath('meta.current_page', 1)
            ->assertJsonPath('meta.total', 1);
    }

    public function test_program_list_can_filter_open_and_closed_programs(): void
    {
        AssistanceProgram::create([
            'name' => 'Open Program',
            'description' => 'Open',
            'eligibility' => 'Everyone',
            'is_open' => true,
        ]);
        AssistanceProgram::create([
            'name' => 'Closed Program',
            'description' => 'Closed',
            'eligibility' => 'Everyone',
            'is_open' => false,
        ]);
        Sanctum::actingAs(User::factory()->create(['role' => 'beneficiary']));

        $this->getJson('/api/programs?is_open=0')
            ->assertOk()
            ->assertJsonPath('data.0.name', 'Closed Program')
            ->assertJsonPath('meta.total', 1);
    }

    public function test_admin_can_create_update_and_delete_programs(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));

        $this->postJson('/api/programs', [
            'name' => 'Medical Assistance',
            'description' => 'Support for medical costs',
            'eligibility' => 'Registered beneficiaries',
            'is_open' => true,
        ])
            ->assertCreated()
            ->assertJsonPath('name', 'Medical Assistance')
            ->assertJsonPath('is_open', true);

        $program = AssistanceProgram::firstOrFail();

        $this->putJson("/api/programs/{$program->id}", [
            'name' => 'Updated Assistance',
            'description' => 'Updated description',
            'eligibility' => 'Updated eligibility',
            'is_open' => false,
        ])
            ->assertOk()
            ->assertJsonPath('name', 'Updated Assistance')
            ->assertJsonPath('is_open', false);

        $this->deleteJson("/api/programs/{$program->id}")->assertOk();

        $this->assertDatabaseMissing('assistance_programs', ['id' => $program->id]);
    }

    public function test_beneficiary_cannot_create_programs(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'beneficiary']));

        $this->postJson('/api/programs', [
            'name' => 'Unauthorized Program',
            'description' => 'Should not be created',
            'eligibility' => 'Nobody',
            'is_open' => true,
        ])->assertForbidden();

        $this->assertDatabaseMissing('assistance_programs', ['name' => 'Unauthorized Program']);
    }
}
