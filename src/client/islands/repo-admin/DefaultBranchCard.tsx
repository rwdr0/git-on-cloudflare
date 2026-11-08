import { useState } from "react";
import { GitBranch } from "lucide-react";
import { Button } from "@/client/components/ui/button";
import { Card } from "@/client/components/ui/card";
import { classifyRef, shortRefName } from "@/shared/git/ref-display";

export type DefaultBranchCardProps = {
  head?: { target?: string; unborn?: boolean };
  refs: Array<{ name: string; oid: string }>;
  pending: Record<string, boolean>;
  setDefaultBranch: (target: string) => Promise<void>;
};

// Lets the repo admin point HEAD at an existing branch. Only refs under
// `refs/heads/` are offered: the PUT /admin/head endpoint stores whatever
// target it is given, so a typo'd or tag target would leave HEAD unborn and
// make `git clone` check out nothing. Restricting the choices here is the
// guard against that.
export function DefaultBranchCard({
  head,
  refs,
  pending,
  setDefaultBranch,
}: DefaultBranchCardProps) {
  const branchRefNames = refs
    .map((ref) => ref.name)
    .filter((name) => classifyRef(name) === "branch");
  const currentTarget = head?.target ?? "";
  // When HEAD points at a branch that no longer exists (or the repo is still
  // empty), preselect the first real branch so "Save" fixes it in one click.
  const initialSelection = branchRefNames.includes(currentTarget)
    ? currentTarget
    : (branchRefNames[0] ?? "");
  const [selectedTarget, setSelectedTarget] = useState(initialSelection);

  const isSaving = pending["set-default-branch"] === true;
  const isUnchanged = selectedTarget === currentTarget;

  return (
    <Card>
      <h2 className="mb-4 text-xl font-semibold">Default Branch</h2>
      {branchRefNames.length ? (
        <div className="space-y-3">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            The branch <code>git clone</code> checks out and the web UI shows first.
            {head?.unborn && currentTarget ? (
              <>
                {" "}
                HEAD currently points at <code>{shortRefName(currentTarget)}</code>, which does not
                exist.
              </>
            ) : null}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label htmlFor="default-branch" className="sr-only">
              Default branch
            </label>
            <select
              id="default-branch"
              className="flex-1 rounded-xl border border-zinc-300 bg-white px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-accent-500 dark:border-zinc-700 dark:bg-zinc-800"
              value={selectedTarget}
              onChange={(event) => setSelectedTarget(event.target.value)}
              disabled={isSaving}
            >
              {branchRefNames.map((name) => (
                <option key={name} value={name}>
                  {shortRefName(name)}
                </option>
              ))}
            </select>
            <Button
              type="button"
              onClick={() => void setDefaultBranch(selectedTarget)}
              disabled={isSaving || isUnchanged || !selectedTarget}
            >
              <GitBranch className="mr-2 inline h-4 w-4 align-[-2px]" aria-hidden="true" />
              <span className="label">{isSaving ? "Saving..." : "Save"}</span>
            </Button>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Git clients may see the old default for up to a minute while the refs cache expires.
          </p>
        </div>
      ) : (
        <p className="italic text-zinc-500">Push a branch first to choose a default branch.</p>
      )}
    </Card>
  );
}
