<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StoreShipmentCostRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'shipment_id' => ['required', 'uuid', 'exists:shipments,id'],
            'costs' => ['required', 'array'],
            'costs.*.id' => ['required', 'uuid'],
            'costs.*.name' => ['required', 'string'],
            'costs.*.amount' => ['required', 'numeric'],
            'costs.*.cost_category_id' => ['required', 'uuid', 'exists:cost_categories,id'],
            'costs.*.side' => ['required', 'in:client,company'],
            'costs.*.type' => ['required', 'in:fixed,variable'],
            'costs.*.parent_id' => ['nullable', 'uuid'],
        ];
    }
}
