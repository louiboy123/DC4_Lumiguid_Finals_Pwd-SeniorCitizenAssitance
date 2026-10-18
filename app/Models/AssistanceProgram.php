<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AssistanceProgram extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description', 'eligibility', 'is_open'];

    protected $casts = [
        'is_open' => 'boolean',
    ];

    public function applications(): HasMany
    {
        return $this->hasMany(AssistanceApplication::class);
    }
}
