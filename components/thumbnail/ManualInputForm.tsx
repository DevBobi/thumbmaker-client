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

const formSchema = z.object({
  videoTitle: z.string().min(1, "Video title is required"),
  videoDescription: z.string().min(1, "Video description is required"),
  scriptHighlight1: z.string().min(1, "At least one highlight is required"),
  scriptHighlight2: z.string().optional(),
  scriptHighlight3: z.string().optional(),
  scriptHighlight4: z.string().optional(),
  scriptHighlight5: z.string().optional(),
  targetAudience: z.string().min(1, "Target audience is required"),
});

interface ManualInputFormProps {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
}

const ManualInputForm = ({ onSubmit }: ManualInputFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      videoTitle: "",
      videoDescription: "",
      scriptHighlight1: "",
      scriptHighlight2: "",
      scriptHighlight3: "",
      scriptHighlight4: "",
      scriptHighlight5: "",
      targetAudience: "",
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
                The main title that will appear in your thumbnail
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="videoDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter a brief description of your video"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                This helps us understand the context of your video
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Script Highlights</h3>
          <p className="text-sm text-muted-foreground">
            Add 2-5 key points or highlights from your video
          </p>

          {[1, 2, 3, 4, 5].map((num) => (
            <FormField
              key={num}
              control={form.control}
              name={`scriptHighlight${num}` as keyof z.infer<typeof formSchema>}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Highlight {num}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={`Enter highlight ${num}`}
                      {...field}
                    />
                  </FormControl>
                  {num === 1 && <FormMessage />}
                </FormItem>
              )}
            />
          ))}
        </div>

        <FormField
          control={form.control}
          name="targetAudience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Audience</FormLabel>
              <FormControl>
                <Input
                  placeholder="Who is this video for? (e.g., Beginners, Tech enthusiasts)"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                This helps us tailor the thumbnail style to your audience
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Continue
        </Button>
      </form>
    </Form>
  );
};

export default ManualInputForm; 