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

            $table->decimal('total_fixed', 20, 2)->default(0);
            $table->decimal('total_variable', 20, 2)->default(0);
            $table->decimal('total_all', 20, 2)->default(0);

            $table->timestamps();
        });

        Schema::create('shipment_cost_totals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shipment_id')->constrained()->cascadeOnDelete();
            $table->enum('side', ['client', 'company']);
            $table->decimal('total_fixed', 20, 2)->default(0);
            $table->decimal('total_variable', 20, 2)->default(0);
            $table->decimal('total_all', 20, 2)->default(0);
            $table->timestamps();

            $table->unique(['shipment_id', 'side']);
        });

        Schema::create('cost_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['fixed', 'variable']);
            $table->boolean('is_fixed_key')->default(false);
            $table->timestamps();

            $table->unique(['name', 'type']);
        });

        Schema::create('cost_items', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('shipment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('cost_category_id')->constrained()->cascadeOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('cost_items')->nullOnDelete();

            $table->enum('side', ['client', 'company']);
            $table->unsignedBigInteger('mirrored_from_id')->nullable(); 

            $table->string('name');
            $table->decimal('amount', 20, 2)->nullable();
            $table->timestamps();

            $table->foreign('mirrored_from_id')->references('id')->on('cost_items')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cost_items');
        Schema::dropIfExists('cost_categories');
        Schema::dropIfExists('shipments');
    }
};
