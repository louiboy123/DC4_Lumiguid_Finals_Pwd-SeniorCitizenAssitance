<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ApplicationDocument;
use App\Models\AssistanceApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ApplicationDocumentController extends Controller
{
    public function index(Request $request, AssistanceApplication $application)
    {
        if (auth()->user()->role !== 'admin' && $application->user_id !== auth()->id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return $application->documents()->latest()->get();
    }

    public function store(Request $request, AssistanceApplication $application)
    {
        if (auth()->user()->role !== 'admin' && $application->user_id !== auth()->id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'document_type' => 'required|string|max:255',
            'file' => 'required|file|max:5120',
        ]);

        $path = Storage::disk('public')->putFile('documents/applications', $data['file']);

        $document = ApplicationDocument::create([
            'assistance_application_id' => $application->id,
            'document_type' => $data['document_type'],
            'file_path' => $path,
            'verification_status' => 'pending',
        ]);

        return response()->json($document, 201);
    }

    public function verify(Request $request, ApplicationDocument $document)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'verification_status' => 'required|in:pending,verified,rejected',
        ]);

        $document->update(['verification_status' => $data['verification_status']]);

        return response()->json($document);
    }
}
