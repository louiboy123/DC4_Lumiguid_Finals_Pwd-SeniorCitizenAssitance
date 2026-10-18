<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AssistanceApplication;
use App\Models\BeneficiaryProfile;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats()
    {
        $user = auth()->user();

        $query = AssistanceApplication::query();
        if ($user->role !== 'admin') {
            $query->where('user_id', $user->id);
        }

        $total = $query->count();
        $pending = $query->whereIn('status', ['submitted', 'under_review'])->count();
        $approved = $query->where('status', 'approved')->count();
        $needsCorrection = $query->where('status', 'needs_correction')->count();
        $rejected = $query->where('status', 'rejected')->count();

        $upcomingAppointments = DB::table('appointments')
            ->join('assistance_applications', 'appointments.assistance_application_id', '=', 'assistance_applications.id')
            ->where('appointments.status', 'scheduled')
            ->where('appointments.appointment_date', '>=', now())
            ->when($user->role !== 'admin', fn ($q) => $q->where('assistance_applications.user_id', $user->id))
            ->count();

        $byBeneficiaryType = BeneficiaryProfile::join('users', 'beneficiary_profiles.user_id', '=', 'users.id')
            ->join('assistance_applications', 'assistance_applications.user_id', '=', 'users.id')
            ->when($user->role !== 'admin', fn ($q) => $q->where('assistance_applications.user_id', $user->id))
            ->select('beneficiary_profiles.beneficiary_type as type', DB::raw('count(*) as count'))
            ->groupBy('beneficiary_profiles.beneficiary_type')
            ->get()
            ->mapWithKeys(fn ($row) => [$row->type => (int) $row->count]);

        return response()->json([
            'total_applications' => $total,
            'pending_reviews' => $pending,
            'approved_requests' => $approved,
            'needs_correction' => $needsCorrection,
            'rejected_requests' => $rejected,
            'upcoming_appointments' => $upcomingAppointments,
            'applications_by_beneficiary_type' => $byBeneficiaryType,
        ]);
    }
}
