<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AssistanceApplication;
use App\Models\StatusHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AssistanceApplicationController extends Controller
{
    public function index(Request $request)
    {
        $query = AssistanceApplication::with(['user.profile', 'program', 'documents', 'statusHistory.changer']);

        if (auth()->user()->role !== 'admin') {
            $query->where('user_id', auth()->id());
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('program_id')) {
            $query->where('assistance_program_id', $request->program_id);
        }

        if ($request->filled('beneficiary_type')) {
            $query->join('users as u2', 'assistance_applications.user_id', '=', 'u2.id')
                ->join('beneficiary_profiles as bp', 'bp.user_id', '=', 'u2.id')
                ->where('bp.beneficiary_type', $request->beneficiary_type);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('submitted_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('submitted_at', '<=', $request->date_to);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('application_number', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($u) use ($search) {
                        $u->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        $applications = $query->latest()->paginate(10)->withQueryString();

        return response()->json([
            'data' => $applications->items(),
            'meta' => [
                'current_page' => $applications->currentPage(),
                'last_page' => $applications->lastPage(),
                'from' => $applications->firstItem(),
                'to' => $applications->lastItem(),
                'total' => $applications->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'assistance_program_id' => 'required|exists:assistance_programs,id',
            'remarks' => 'nullable|string',
        ]);

        $application = AssistanceApplication::create([
            'user_id' => auth()->id(),
            'assistance_program_id' => $data['assistance_program_id'],
            'application_number' => 'APP-'.date('Ymd').'-'.strtoupper(Str::random(6)),
            'status' => 'submitted',
            'submitted_at' => now(),
            'remarks' => $data['remarks'] ?? null,
        ]);

        StatusHistory::create([
            'assistance_application_id' => $application->id,
            'changed_by' => auth()->id(),
            'status' => 'submitted',
            'remarks' => 'Application submitted',
        ]);

        return response()->json($application->load('user.profile', 'program'), 201);
    }

    public function show(AssistanceApplication $application)
    {
        if (auth()->user()->role !== 'admin' && $application->user_id !== auth()->id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return $application->load(['user.profile', 'program', 'documents', 'appointments', 'statusHistory.changer']);
    }

    public function update(Request $request, AssistanceApplication $application)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'status' => 'sometimes|in:submitted,under_review,needs_correction,approved,rejected',
            'remarks' => 'nullable|string',
        ]);

        if (isset($data['status']) && $data['status'] !== $application->status) {
            StatusHistory::create([
                'assistance_application_id' => $application->id,
                'changed_by' => auth()->id(),
                'status' => $data['status'],
                'remarks' => $data['remarks'] ?? null,
            ]);
        }

        $application->update([
            'status' => $data['status'] ?? $application->status,
            'remarks' => $data['remarks'] ?? $application->remarks,
        ]);

        return response()->json($application->load('statusHistory.changer'));
    }
}
