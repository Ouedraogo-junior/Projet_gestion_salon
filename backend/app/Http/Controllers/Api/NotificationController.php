<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\NotificationService;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    protected NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Liste des notifications de l'utilisateur connecté
     */
    public function index(Request $request)
    {
        $nonLuesOnly = $request->boolean('non_lues_only', false);
        $limit = $request->input('limit', 50);

        $notifications = $this->notificationService->getNotifications(
            userId: auth()->id(),
            nonLuesOnly: $nonLuesOnly,
            limit: $limit
        );

        $nonLues = $this->notificationService->compterNonLues(auth()->id());

        return response()->json([
            'success' => true,
            'data' => $notifications,
            'meta' => [
                'non_lues' => $nonLues,
                'total' => $notifications->count(),
            ],
        ]);
    }

    /**
     * Compter les notifications non lues
     */
    public function count()
    {
        $count = $this->notificationService->compterNonLues(auth()->id());

        return response()->json([
            'success' => true,
            'data' => [
                'count' => $count,
            ],
        ]);
    }

    /**
     * Marquer une notification comme lue
     */
    public function markAsRead($id)
    {
        $notification = Notification::where('id', $id)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        $notification->marquerCommeLu();

        return response()->json([
            'success' => true,
            'message' => 'Notification marquée comme lue',
        ]);
    }

    /**
     * Marquer toutes les notifications comme lues
     */
    public function markAllAsRead()
    {
        $this->notificationService->marquerToutCommeLu(auth()->id());

        return response()->json([
            'success' => true,
            'message' => 'Toutes les notifications ont été marquées comme lues',
        ]);
    }

    /**
     * Supprimer une notification
     */
    public function destroy($id)
    {
        $notification = Notification::where('id', $id)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        $notification->delete();

        return response()->json([
            'success' => true,
            'message' => 'Notification supprimée',
        ]);
    }

    /**
     * Supprimer toutes les notifications lues
     */
    public function deleteRead()
    {
        $deleted = Notification::where('user_id', auth()->id())
            ->where('lu', true)
            ->delete();

        return response()->json([
            'success' => true,
            'message' => "{$deleted} notifications supprimées",
        ]);
    }
}