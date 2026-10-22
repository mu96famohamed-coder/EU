import { getServiceSearchIndex } from '../../../lib/serviceSearchIndex';
export const dynamic = 'force-static';
export function GET() {
  return Response.json(getServiceSearchIndex(), {
    headers: {'Cache-Control':'public, max-age=0, must-revalidate'},
  });
}
