<?php

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\ApplicationDocument;
use App\Models\AssistanceApplication;
use App\Models\AssistanceProgram;
use App\Models\BeneficiaryProfile;
use App\Models\StatusHistory;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $admin = User::updateOrCreate(
            ['email' => 'admin@lgu.gov.ph'],
            ['name' => 'MSWDO Admin', 'password' => bcrypt('password'), 'role' => 'admin']
        );

        $beneficiaries = [
            ['name' => 'Juan Dela Cruz', 'email' => 'juan@example.com', 'type' => 'pwd', 'id' => 'PWD-0001', 'disability' => 'Orthopedic', 'birth' => '1985-03-12', 'addr' => 'Brgy. San Antonio, Municipality', 'contact' => '09123456789'],
            ['name' => 'Maria Santos', 'email' => 'maria@example.com', 'type' => 'senior_citizen', 'id' => 'SC-0002', 'disability' => null, 'birth' => '1950-07-20', 'addr' => 'Brgy. Santa Cruz, Municipality', 'contact' => '09234567890'],
            ['name' => 'Pedro Reyes', 'email' => 'pedro@example.com', 'type' => 'pwd', 'id' => 'PWD-0003', 'disability' => 'Visual', 'birth' => '1990-11-05', 'addr' => 'Brgy. Santo Tomas, Municipality', 'contact' => '09345678901'],
        ];

        $beneficiaryUsers = [];
        foreach ($beneficiaries as $b) {
            $user = User::updateOrCreate(
                ['email' => $b['email']],
                ['name' => $b['name'], 'password' => bcrypt('password'), 'role' => 'beneficiary']
            );
            BeneficiaryProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'beneficiary_type' => $b['type'],
                    'id_number' => $b['id'],
                    'birth_date' => $b['birth'],
                    'address' => $b['addr'],
                    'contact_number' => $b['contact'],
                    'disability_type' => $b['disability'],
                ]
            );
            $beneficiaryUsers[] = $user;
        }

        $programs = [
            ['name' => 'Financial Assistance for PWDs', 'description' => 'Monthly cash assistance for registered persons with disabilities.', 'eligibility' => 'Registered PWD with valid PWD ID.', 'open' => true],
            ['name' => 'Senior Citizen Pension', 'description' => 'Quarterly stipend for senior citizens aged 60 and above.', 'eligibility' => 'Senior citizen with valid OSCA ID.', 'open' => true],
            ['name' => 'Medical Assistance Program', 'description' => 'Subsidized medicines and medical services for indigent PWDs and seniors.', 'eligibility' => 'Indigent PWD or senior citizen.', 'open' => true],
            ['name' => 'Livelihood Training', 'description' => 'Skills training and starter kits for sustainable livelihood.', 'eligibility' => 'PWD or senior citizen capable of training.', 'open' => false],
        ];

        $programRecords = [];
        foreach ($programs as $p) {
            $programRecords[] = AssistanceProgram::updateOrCreate(
                ['name' => $p['name']],
                [
                    'description' => $p['description'],
                    'eligibility' => $p['eligibility'],
                    'is_open' => $p['open'],
                ]
            );
        }

        Announcement::updateOrCreate(
            ['title' => 'Portal Launch'],
            ['message' => 'Welcome to the PWD & Senior Citizen Assistance Portal. You can now submit and track assistance applications online.', 'publish_date' => now(), 'is_active' => true]
        );

        Announcement::updateOrCreate(
            ['title' => 'Livelihood Training Temporarily Closed'],
            ['message' => 'The Livelihood Training program is currently not accepting new applications.', 'publish_date' => now(), 'is_active' => true]
        );

        foreach ($beneficiaryUsers as $index => $user) {
            $program = $programRecords[array_rand($programRecords)];

            $application = AssistanceApplication::updateOrCreate(
                ['user_id' => $user->id, 'assistance_program_id' => $program->id],
                [
                    'application_number' => 'APP-'.date('Ymd').'-'.Str::upper(Str::random(4)),
                    'status' => $index === 0 ? 'under_review' : 'submitted',
                    'submitted_at' => now()->subDays(rand(1, 10)),
                    'remarks' => $index === 0 ? 'Documents being reviewed by staff.' : null,
                ]
            );

            StatusHistory::create([
                'assistance_application_id' => $application->id,
                'changed_by' => $user->id,
                'status' => 'submitted',
                'remarks' => 'Application submitted.',
            ]);

            if ($index === 0) {
                StatusHistory::create([
                    'assistance_application_id' => $application->id,
                    'changed_by' => $admin->id,
                    'status' => 'under_review',
                    'remarks' => 'Under review by MSWDO staff.',
                ]);
            }

            ApplicationDocument::updateOrCreate(
                ['assistance_application_id' => $application->id, 'document_type' => 'Valid ID'],
                [
                    'file_path' => 'documents/applications/sample-id.pdf',
                    'verification_status' => $index === 0 ? 'verified' : 'pending',
                ]
            );
        }

        $firstApp = AssistanceApplication::first();
        if ($firstApp) {
            \App\Models\Appointment::updateOrCreate(
                ['assistance_application_id' => $firstApp->id, 'purpose' => 'Eligibility assessment'],
                [
                    'appointment_date' => now()->addDays(3)->setHour(9)->setMinute(0),
                    'status' => 'scheduled',
                ]
            );
        }
    }
}
