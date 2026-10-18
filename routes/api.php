<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AssistanceProgramController;
use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\AssistanceApplicationController;
use App\Http\Controllers\Api\ApplicationDocumentController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\DashboardController;

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('user', [AuthController::class, 'me']);
    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('programs', [AssistanceProgramController::class, 'index']);
    Route::post('programs', [AssistanceProgramController::class, 'store'])->middleware('role:admin');
    Route::get('programs/{program}', [AssistanceProgramController::class, 'show']);
    Route::put('programs/{program}', [AssistanceProgramController::class, 'update'])->middleware('role:admin');
    Route::delete('programs/{program}', [AssistanceProgramController::class, 'destroy'])->middleware('role:admin');

    Route::get('announcements', [AnnouncementController::class, 'index']);
    Route::post('announcements', [AnnouncementController::class, 'store'])->middleware('role:admin');
    Route::get('announcements/{announcement}', [AnnouncementController::class, 'show']);
    Route::put('announcements/{announcement}', [AnnouncementController::class, 'update'])->middleware('role:admin');
    Route::delete('announcements/{announcement}', [AnnouncementController::class, 'destroy'])->middleware('role:admin');

    Route::get('applications', [AssistanceApplicationController::class, 'index']);
    Route::post('applications', [AssistanceApplicationController::class, 'store']);
    Route::get('applications/{application}', [AssistanceApplicationController::class, 'show']);
    Route::put('applications/{application}', [AssistanceApplicationController::class, 'update'])->middleware('role:admin');

    Route::get('applications/{application}/documents', [ApplicationDocumentController::class, 'index']);
    Route::post('applications/{application}/documents', [ApplicationDocumentController::class, 'store']);
    Route::patch('documents/{document}/verify', [ApplicationDocumentController::class, 'verify'])->middleware('role:admin');

    Route::get('appointments', [AppointmentController::class, 'index']);
    Route::post('appointments', [AppointmentController::class, 'store'])->middleware('role:admin');
    Route::put('appointments/{appointment}', [AppointmentController::class, 'update'])->middleware('role:admin');
    Route::delete('appointments/{appointment}', [AppointmentController::class, 'destroy'])->middleware('role:admin');

    Route::get('profile', [ProfileController::class, 'show']);
    Route::put('profile', [ProfileController::class, 'update']);

    Route::get('dashboard/stats', [DashboardController::class, 'stats']);
});
