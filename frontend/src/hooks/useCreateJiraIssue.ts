import { useState } from "react";

export const useCreateJiraIssue = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createIssue = async (
    projectKey: string,
    summary: string,
    description: string
  ): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        throw new Error("No access token found. Please authenticate.");
      }

      const payload = {
        fields: {
          project: { key: projectKey },
          summary,
          description: {
            type: "doc",
            version: 1,
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    text: description, // Actual issue description
                    type: "text"
                  }
                ]
              }
            ]
          },
          issuetype: { name: "Bug" }
        }
      };
      const response = await fetch("http://localhost:4000/create-issue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
      }

      const data: { id: string } = await response.json();
      alert(`Issue created with ID: ${data.id}`);
    } catch (error) {
      if (error instanceof Error) {
        setError(`Failed to create issue: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return { createIssue, loading, error };
};
