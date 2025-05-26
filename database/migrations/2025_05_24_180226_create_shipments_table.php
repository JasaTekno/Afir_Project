<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shipments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->date('date');

            $table->timestamps();
        });

        Schema::create('shipment_cost_totals', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('shipment_id')->constrained()->cascadeOnDelete();
            $table->enum('side', ['client', 'company']);
            $table->decimal('total_fixed', 20, 2)->default(0);
            $table->decimal('total_variable', 20, 2)->default(0);
            $table->decimal('total_all', 20, 2)->default(0);
            $table->timestamps();

            $table->unique(['shipment_id', 'side']);
        });

        Schema::create('cost_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('shipment_id')->constrained()->cascadeOnDelete();

            $table->uuid('parent_id')->nullable();

            $table->enum('side', ['client', 'company']);
            $table->enum('calculation_type', ['manual', 'multiply_children'])->default('manual')->after('side');

            $table->string('name');
            $table->decimal('amount', 20, 2)->nullable();
            $table->timestamps();
        });

        Schema::table('cost_items', function (Blueprint $table) {
            $table->foreign('parent_id')->references('id')->on('cost_items')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cost_items');
        Schema::dropIfExists('cost_categories');
        Schema::dropIfExists('shipments');
    }
};
