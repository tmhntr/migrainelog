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
    return <div>Loading episodes...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Episodes</h1>
          <p className="text-muted-foreground mt-2">
            Track and manage your migraine episodes
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Episode
        </Button>
      </div>

      <div className="grid gap-6">
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
          <div className="text-center py-12">
            <p className="text-muted-foreground">No episodes recorded yet</p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              variant="outline"
              className="mt-4"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create your first episode
            </Button>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle role="heading">New Episode</DialogTitle>
            <DialogDescription>
              Record details about your migraine episode
            </DialogDescription>
          </DialogHeader>
          <EpisodeForm onSuccess={() => setIsDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
