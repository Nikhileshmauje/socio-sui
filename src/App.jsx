import React, { useState, useEffect } from "react";
import { JsonRpcProvider, TransactionBlock } from "@mysten/sui";
import CreatePost from "./CreatePost";
import Post from "./Post";
import "./styles.css";

// Initialize the Sui provider
const provider = new JsonRpcProvider();

const App = () => {
  const [posts, setPosts] = useState([]);
  const [userAddress, setUserAddress] = useState("");

  useEffect(() => {
    // Fetch user's wallet address and posts
    const connectWallet = async () => {
      const address = await window.suiWallet.getActiveAccount();
      setUserAddress(address);
      fetchPosts(address);
    };

    connectWallet();
  }, []);

  const fetchPosts = async (address) => {
    try {
      const objects = await provider.getOwnedObjects({
        owner: address,
        filter: { StructType: "<PACKAGE_ID>::SocialMedia::Post" },
      });

      const postDetails = await Promise.all(
        objects.data.map((obj) => provider.getObject({ id: obj.objectId }))
      );

      const formattedPosts = postDetails.map((post) => ({
        id: post.data.objectId,
        content: post.data.fields.content,
        creator: post.data.fields.creator,
        likes: post.data.fields.likes,
      }));

      setPosts(formattedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  return (
    <div className="app">
      <h1>Decentralized Social Media</h1>
      <CreatePost userAddress={userAddress} fetchPosts={fetchPosts} />
      <div className="posts">
        {posts.map((post) => (
          <Post key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default App;
