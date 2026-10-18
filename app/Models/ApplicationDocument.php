<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicationDocument extends Model
{
    use HasFactory;

    protected $fillable = ['assistance_application_id', 'document_type', 'file_path', 'verification_status'];

    public function application(): BelongsTo
    {
        return $this->belongsTo(AssistanceApplication::class);
    }
}
