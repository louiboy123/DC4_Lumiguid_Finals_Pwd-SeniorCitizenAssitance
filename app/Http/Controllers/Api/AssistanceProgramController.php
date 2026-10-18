<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AssistanceProgram;
use Illuminate\Http\Request;

class AssistanceProgramController extends Controller
{
    public function index(Request $request)
    {
        $query = AssistanceProgram::withCount('applications')->latest();

        if ($request->has('is_open')) {
            $query->where('is_open', $request->boolean('is_open'));
        }

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();

            $query->where(function ($programs) use ($search) {
                $programs->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('eligibility', 'like', "%{$search}%");
            });
        }

        $programs = $query->paginate(10)->withQueryString();

        return response()->json([
            'data' => $programs->items(),
            'meta' => [
                'current_page' => $programs->currentPage(),
                'last_page' => $programs->lastPage(),
                'from' => $programs->firstItem(),
                'to' => $programs->lastItem(),
                'total' => $programs->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'eligibility' => 'required|string',
            'is_open' => 'sometimes|boolean',
        ]);

        $program = AssistanceProgram::create($data);

        return response()->json($program->loadCount('applications'), 201);
    }

    public function show(AssistanceProgram $program)
    {
        return $program->load('applications.user.profile');
    }

    public function update(Request $request, AssistanceProgram $program)
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'eligibility' => 'sometimes|string',
            'is_open' => 'sometimes|boolean',
        ]);

        $program->update($data);

        return response()->json($program->loadCount('applications'));
    }

    public function destroy(AssistanceProgram $program)
    {
        $program->delete();

        return response()->json(['message' => 'Program deleted']);
    }
}
