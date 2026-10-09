import z from "zod";


export  const CreatePostSchema = z.object({  

   title: z.string().min(1, "Post title is required"),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Post content is required"),

}) 

export type PostFormValues = z.infer<typeof CreatePostSchema>