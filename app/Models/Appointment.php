<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = ['assistance_application_id', 'appointment_date', 'purpose', 'status'];

    protected $casts = [
        'appointment_date' => 'datetime',
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(AssistanceApplication::class);
    }
}
