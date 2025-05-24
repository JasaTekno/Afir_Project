<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('shipments', function (Blueprint $table) {
            $table->uuid();
            $table->string('title');
            $table->date('date');
            $table->timestamps();
        });

        Schema::create('cost_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['fixed', 'variable']);
            $table->boolean('is_fixed_key')->default(false); // untuk 5 cost tetap awal
            $table->timestamps();
        });

        Schema::create('cost_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shipment_id')->constrained()->cascadeOnDelete();  // Laporan mana
            $table->foreignId('cost_category_id')->constrained()->cascadeOnDelete(); // Masuk kategori mana
            $table->foreignId('parent_id')->nullable()->constrained('cost_items')->nullOnDelete(); // sub item dari item lain
            $table->string('name');
            $table->decimal('amount', 20, 2)->nullable(); // Diisi jika leaf, bisa null jika punya sub
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cost_items');
        Schema::dropIfExists('cost_categories');
        Schema::dropIfExists('shipments');
    }
};
