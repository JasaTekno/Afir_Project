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
            $table->enum('status', ['draft', 'active', 'completed', 'cancelled'])->default('draft');
            $table->text('description')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['date', 'status']);
            $table->index('created_at');
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
            $table->uuid("id")->primary();
            $table->foreignUuid('shipment_id')->constrained()->cascadeOnDelete();
            $table->uuid('parent_id')->nullable();

            $table->enum('side', ['client', 'company']);
            $table->enum('type', ['fixed', 'variable']);
            $table->enum('calculation_type', ['manual', 'multiply_children', 'sum_with_children'])->default('manual');

            $table->string('name');
            $table->decimal('amount', 20, 2)->default(0);

            $table->timestamps();
            $table->softDeletes();

            $table->index(['shipment_id', 'parent_id']);
            $table->index(['side', 'type']);
        });

        Schema::table('cost_items', function (Blueprint $table) {
            $table->foreign('parent_id')
                ->references('id')
                ->on('cost_items')
                ->nullOnDelete();
        });

        Schema::create('cost_item_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('cost_item_id')->constrained('cost_items', 'id')->cascadeOnDelete();
            $table->string('action');
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('changed_by')->nullable();
            $table->timestamps();

            $table->index(['cost_item_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cost_item_audit_logs');
        Schema::dropIfExists('cost_items');
        Schema::dropIfExists('shipment_cost_totals');
        Schema::dropIfExists('shipments');
    }
};
