<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function index(Request $request)
    {
        $query = Announcement::latest();

        if (! $request->boolean('all')) {
            $query->where('is_active', true);
        }

        return $query->paginate(10)->withQueryString();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'publish_date' => 'sometimes|date',
            'is_active' => 'sometimes|boolean',
        ]);

        $announcement = Announcement::create($data);

        return response()->json($announcement, 201);
    }

    public function show(Announcement $announcement)
    {
        return $announcement;
    }

    public function update(Request $request, Announcement $announcement)
    {
        $data = $request->validate([
            'title' => 'sometimes|string|max:255',
            'message' => 'sometimes|string',
            'publish_date' => 'sometimes|date',
            'is_active' => 'sometimes|boolean',
        ]);

        $announcement->update($data);

        return response()->json($announcement);
    }

    public function destroy(Announcement $announcement)
    {
        $announcement->delete();

        return response()->json(['message' => 'Announcement deleted']);
    }
}
