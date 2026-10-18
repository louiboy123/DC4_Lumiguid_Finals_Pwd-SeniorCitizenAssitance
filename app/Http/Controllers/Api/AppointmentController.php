<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\AssistanceApplication;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Appointment::with(['application.user.profile', 'application.program']);

        if (auth()->user()->role !== 'admin') {
            $query->whereHas('application', function ($q) {
                $q->where('user_id', auth()->id());
            });
        }

        return $query->latest()->paginate(10)->withQueryString();
    }

    public function store(Request $request)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'assistance_application_id' => 'required|exists:assistance_applications,id',
            'appointment_date' => 'required|date|after:now',
            'purpose' => 'required|string|max:255',
            'status' => 'sometimes|in:scheduled,completed,cancelled',
        ]);

        $appointment = Appointment::create($data);

        return response()->json($appointment->load('application.user.profile'), 201);
    }

    public function update(Request $request, Appointment $appointment)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'appointment_date' => 'sometimes|date|after:now',
            'purpose' => 'sometimes|string|max:255',
            'status' => 'sometimes|in:scheduled,completed,cancelled',
        ]);

        $appointment->update($data);

        return response()->json($appointment->load('application.user.profile'));
    }

    public function destroy(Appointment $appointment)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $appointment->delete();

        return response()->json(['message' => 'Appointment deleted']);
    }
}
