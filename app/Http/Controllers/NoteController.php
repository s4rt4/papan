<?php

namespace App\Http\Controllers;

use App\Models\Note;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NoteController extends Controller
{
    public function index(): JsonResponse
    {
        $note = Note::where('user_id', Auth::id())->first();

        return response()->json(['content' => $note?->content ?? '']);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate(['content' => 'nullable|string|max:10000']);

        Note::updateOrCreate(
            ['user_id' => Auth::id()],
            ['content' => $request->input('content', '')]
        );

        return response()->json(['success' => true]);
    }

    public function destroy(): JsonResponse
    {
        Note::where('user_id', Auth::id())->delete();

        return response()->json(['success' => true]);
    }
}
