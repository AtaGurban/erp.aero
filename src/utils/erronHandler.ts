export default async function errorHandler(error: any) {
    console.error(error);
    if (error instanceof Error) {
      return { success: false, message: error.message, data: null };
    } else {
      return { success: false, message: "Something went wrong", data: null };
    }
  }