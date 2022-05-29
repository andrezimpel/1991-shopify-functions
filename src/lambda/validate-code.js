import axios from 'axios'

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
};

export async function handler(event, context) {
  try {
    const { code, id } = event.queryStringParameters
    const response = await axios.post('https://10kmore-com.myshopify.com/admin/api/2022-04/graphql.json', JSON.stringify({
      query: `
          query ProductQuery($id: ID!) {
            product(id: $id){
              title
              handle
              metafield(namespace:"my_fields", key: "access_code") {
                key
                value
              }
            }
          }
        `,
      variables: {
        id: `gid://shopify/Product/${id}`
      },
    }), {
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": "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"
      }
    })

    const { product } = response.data.data
    const responseCode = product.metafield.value

    let codeResponse = { access: "denied" }

    if (responseCode.toLowerCase() === code.toLowerCase()) {
      codeResponse = {
    		access: "granted", url: `/products/${product.handle}?code=${responseCode}`, code: responseCode
    	}
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(codeResponse)
    }
  } catch (err) {
    console.log(err) // output to netlify function log
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ access: "denied" }) // Could be a custom message or object i.e. JSON.stringify(err)
    }
  }
}
