import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  videoTitle: z.string().min(1, "Video title is required"),
  scriptContent: z.string().min(1, "Script content is required"),
  youtubeLink: z.string().optional(),
  documentFile: z.any().optional(),
});

interface AutomatedInputFormProps {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
}

const AutomatedInputForm = ({ onSubmit }: AutomatedInputFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      videoTitle: "",
      scriptContent: "",
      youtubeLink: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="videoTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter your video title" {...field} />
              </FormControl>
              <FormDescription>
                This will be used to generate relevant thumbnails
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="text">Text Input</TabsTrigger>
            <TabsTrigger value="youtube">YouTube Link</TabsTrigger>
            <TabsTrigger value="document">Upload Document</TabsTrigger>
          </TabsList>

          <TabsContent value="text">
            <FormField
              control={form.control}
              name="scriptContent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Script / Overview</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Paste your video script or overview here"
                      className="min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="youtube">
            <FormField
              control={form.control}
              name="youtubeLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>YouTube Video Link</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://youtube.com/watch?v=..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    We'll extract the content from your YouTube video
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="document">
            <FormField
              control={form.control}
              name="documentFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Upload Document</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept=".doc,.docx,.txt,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        field.onChange(file);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload your script document (DOC, DOCX, TXT, or PDF)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>

        <Button type="submit" className="w-full">
          Continue
        </Button>
      </form>
    </Form>
  );
};

export default AutomatedInputForm; 