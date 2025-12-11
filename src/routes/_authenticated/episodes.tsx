import { createFileRoute, Link } from "@tanstack/react-router";
import { useEpisodesQuery } from "@/hooks/useEpisodesQuery";
import { EpisodeCard } from "@/components/episodes/EpisodeCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { EpisodeForm } from "@/components/episodes/EpisodeForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Episodes List Route (/episodes)
 *
 * Displays all migraine episodes with ability to create new ones
 */
export const Route = createFileRoute("/_authenticated/episodes")({
  component: Episodes,
});

function Episodes() {
  const { data: episodes, isLoading } = useEpisodesQuery();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Loading episodes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Episodes</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
            Track and manage your migraine episodes
          </p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          size="sm"
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          <span className="sm:inline">New Episode</span>
        </Button>
      </div>

      {/* Episodes List */}
      <div className="grid gap-4 sm:gap-6">
        {episodes && episodes.length > 0 ? (
          episodes.map((episode) => (
            <Link
              key={episode.id}
              to="/episodes/$episodeId"
              params={{ episodeId: episode.id }}
            >
              <EpisodeCard episode={episode} />
            </Link>
          ))
        ) : (
          <div className="text-center py-12 px-4">
            <p className="text-sm sm:text-base text-muted-foreground mb-4">
              No episodes recorded yet
            </p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create your first episode
            </Button>
          </div>
        )}
      </div>

      {/* New Episode Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle role="heading" className="text-lg sm:text-xl">
              New Episode
            </DialogTitle>
            <DialogDescription className="text-sm">
              Record details about your migraine episode
            </DialogDescription>
          </DialogHeader>
          <EpisodeForm onSuccess={() => setIsDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
