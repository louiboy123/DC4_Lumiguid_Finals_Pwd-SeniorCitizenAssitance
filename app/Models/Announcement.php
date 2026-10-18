<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Announcement extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'message', 'publish_date', 'is_active'];

    protected $casts = [
        'publish_date' => 'datetime',
        'is_active' => 'boolean',
    ];
}
