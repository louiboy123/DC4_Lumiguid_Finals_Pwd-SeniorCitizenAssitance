<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BeneficiaryProfile extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'beneficiary_type', 'id_number', 'birth_date', 'address', 'contact_number', 'disability_type'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
