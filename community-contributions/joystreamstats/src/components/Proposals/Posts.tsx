import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { MessageSquare } from "react-feather";

const Posts = (props: { posts: any[] }) => {
  const { posts } = props;
  if (!posts.length) return <div></div>;
  return (
    <div className="float-left">
      <OverlayTrigger
        placement="right"
        overlay={
          <Tooltip id={posts[0].threadId}>
            <div>
              {posts.map((p) => (
                <div key={p.id} className="mb-3">
                  {p.text}
                </div>
              ))}
            </div>
          </Tooltip>
        }
      >
        <div>
          <MessageSquare /> {posts.length}
        </div>
      </OverlayTrigger>
    </div>
  );
};

export default Posts;
