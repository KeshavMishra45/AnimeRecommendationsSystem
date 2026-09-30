import { useEffect, useState } from "react";
import { Poster } from "./Poster";
import { TYPE_META } from "@/lib/kkmanime";
import { useAuth } from "@/lib/auth-context";
import { listComments, addComment, deleteComment } from "@/lib/comments.functions";
import { listFollows, toggleFollow } from "@/lib/follows.functions";
import { getLikeInfo, toggleLike } from "@/lib/likes.functions";

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function LikeButton({ title }) {
  const { user } = useAuth();
  const [info, setInfo] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    getLikeInfo({ data: title.id })
      .then((res) => {
        if (active) setInfo(res);
      })
      .catch((err) => console.error("[likes] failed to load:", err));
    return () => {
      active = false;
    };
  }, [title.id]);

  const onClick = async () => {
    if (!user) return;
    setBusy(true);
    try {
      const res = await toggleLike({
        data: { titleId: title.id, titleName: title.name, titleType: title.type },
      });
      setInfo({ count: res.count, likedByMe: res.liked });
    } catch (err) {
      console.error("[likes] toggle failed:", err);
    } finally {
      setBusy(false);
    }
  };

  const count = info?.count ?? 0;
  const likedByMe = info?.likedByMe ?? false;

  return <button
    type="button"
    className={`like-btn${likedByMe ? " liked" : ""}`}
    onClick={onClick}
    disabled={busy || !user}
    title={user ? undefined : "Sign in to like this"}
  >
      <span aria-hidden="true">{likedByMe ? "❤️" : "🤍"}</span> {count}
    </button>;
}

function FollowButton({ title }) {
  const { user } = useAuth();
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    if (!user) {
      setFollowing(false);
      return;
    }
    listFollows()
      .then((rows) => {
        if (active) setFollowing(rows.some((r) => r.titleId === title.id));
      })
      .catch((err) => console.error("[follow] failed to check status:", err));
    return () => {
      active = false;
    };
  }, [user, title.id]);

  if (!user) return null;

  const onClick = async () => {
    setBusy(true);
    try {
      const res = await toggleFollow({
        data: { titleId: title.id, titleName: title.name, titleType: title.type },
      });
      setFollowing(res.following);
    } catch (err) {
      console.error("[follow] toggle failed:", err);
    } finally {
      setBusy(false);
    }
  };

  return <button
    type="button"
    className={`follow-btn${following ? " following" : ""}`}
    onClick={onClick}
    disabled={busy}
  >
      {following ? "★ Following" : "☆ Follow"}
    </button>;
}

function Comments({ title }) {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState(null);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    listComments({ data: title.id })
      .then((rows) => {
        if (active) setComments(rows);
      })
      .catch((err) => {
        console.error("[comments] load failed:", err);
        if (active) setComments([]);
      });
    return () => {
      active = false;
    };
  }, [title.id]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    setError("");
    try {
      const created = await addComment({
        data: { titleId: title.id, titleName: title.name, titleType: title.type, body },
      });
      setComments((prev) => [created, ...(prev ?? [])]);
      setBody("");
    } catch (err) {
      setError(err?.message ?? "Couldn't post that comment.");
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (id) => {
    const prev = comments;
    setComments((c) => c.filter((cm) => cm.id !== id));
    try {
      await deleteComment({ data: id });
    } catch (err) {
      console.error("[comments] delete failed:", err);
      setComments(prev);
    }
  };

  return <div className="comments-block">
      <h3>Comments</h3>

      {user ? <form className="comment-form" onSubmit={onSubmit}>
          <textarea
    value={body}
    onChange={(e) => setBody(e.target.value)}
    placeholder={`Share your thoughts on ${title.name}...`}
    maxLength={2000}
  />
          {error ? <p className="modal-error">{error}</p> : null}
          <button type="submit" className="modal-submit" disabled={busy || !body.trim()}>
            {busy ? "Posting…" : "Post Comment"}
          </button>
        </form> : <p className="comment-locked">Sign in to join the conversation.</p>}

      {comments === null ? <p className="comment-empty">Loading comments…</p> : comments.length === 0 ? <p className="comment-empty">No comments yet — be the first.</p> : <ul className="comment-list">
          {comments.map((c) => <li className="comment" key={c.id}>
              <div className="comment-head">
                <span className="comment-user">{c.username}</span>
                <span className="comment-date">{timeAgo(c.createdAt)}</span>
                {user && (user.id === c.userId || profile?.id === c.userId) ? <button
    type="button"
    className="comment-delete"
    onClick={() => onDelete(c.id)}
  >
                    Delete
                  </button> : null}
              </div>
              <p>{c.body}</p>
            </li>)}
        </ul>}
    </div>;
}

function TitleDialog({ title, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return <div
    className="dialog-backdrop"
    onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}
  >
      <div className="dialog">
        <button className="dialog-close" type="button" aria-label="Close" onClick={onClose}>
          ✕
        </button>
        <div className="dialog-head">
          <Poster title={title} className="card-poster dialog-poster" />
          <div className="dialog-info">
            <p className="eyebrow">{TYPE_META[title.type].label}</p>
            <h2>{title.name}</h2>
            <div className="chip-row">
              {title.genres.map((g) => <span className="chip" key={g}>
                  {g}
                </span>)}
            </div>
            <p className="dialog-desc">{title.desc}</p>
            <p className="results-meta">
              Main character: <b>{title.character.name}</b> ({title.character.traits.join(", ")})
            </p>
            <div className="dialog-actions">
              <LikeButton title={title} />
              <FollowButton title={title} />
            </div>
          </div>
        </div>
        <Comments title={title} />
      </div>
    </div>;
}
export {
  TitleDialog
};
