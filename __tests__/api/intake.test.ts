/**
 * API Route Tests for /api/intake
 *
 * These tests call the Next.js route handler directly (no running dev server).
 */

describe('/api/intake', () => {
  const createReq = async (body: any) => {
    const { NextRequest } = await import('next/server');
    return new NextRequest('http://localhost/api/intake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  };

  it('should track suggestion_selected action', async () => {
    const { POST } = await import('@/app/api/intake/route');
    const response = await POST(
      await createReq({
        action: 'suggestion_selected',
        suggestionId: 'option1',
      })
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  it('should track form_submitted action', async () => {
    const { POST } = await import('@/app/api/intake/route');
    const response = await POST(
      await createReq({
        action: 'form_submitted',
        message: 'Test message',
        messageLength: 12,
        suggestionId: 'option1',
      })
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  it('should return 400 for missing action', async () => {
    const { POST } = await import('@/app/api/intake/route');
    const response = await POST(await createReq({}));

    expect(response.status).toBe(400);
  });

  it('should return 400 for invalid action', async () => {
    const { POST } = await import('@/app/api/intake/route');
    const response = await POST(
      await createReq({
        action: 'invalid_action',
      })
    );

    expect(response.status).toBe(400);
  });
});
