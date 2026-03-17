exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  try {
    const NOTION_TOKEN = process.env.NOTION_TOKEN;
    const DATABASE_ID = "31bd61b411028066977b000c987f323b";

    if (!NOTION_TOKEN) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "NOTION_TOKEN 沒有設定成功" })
      };
    }

    const data = JSON.parse(event.body || "{}");

    const notionData = {
      parent: { database_id: DATABASE_ID },
      properties: {
        "預約": {
          title: [
            {
              text: { content: "LINE預約" }
            }
          ]
        },
        "日期": {
          date: { start: data.bookingDate }
        },
        "時間": {
          rich_text: [
            {
              text: { content: data.bookingTime || "" }
            }
          ]
        },
        "客人": {
          rich_text: [
            {
              text: { content: data.customer || "" }
            }
          ]
        },
        "服務": {
          rich_text: [
            {
              text: { content: data.services || "" }
            }
          ]
        },
        "備註": {
          rich_text: [
            {
              text: { content: data.notes || "" }
            }
          ]
        },
        "lineUserId": {
          rich_text: [
            {
              text: { content: data.lineUserId || "" }
            }
          ]
        }
      }
    };

    const response = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
      },
      body: JSON.stringify(notionData)
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: result.message || "Notion 寫入失敗",
          detail: result
        })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        notion: result
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message || "Server error"
      })
    };
  }
};
