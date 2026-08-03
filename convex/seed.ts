/**
 * Seed script — run once to populate 10 real-life commissions.
 * Execute: npx convex run seed:run
 *
 * Creates clients, projects with full workflows, participants, measurements,
 * consultations, designs, quotations, payments, garments, production stages,
 * appointments, timeline events, and story updates.
 */
import { internalMutation } from "./_generated/server";

// Helper: date as epoch ms
function d(iso: string): number {
  return new Date(iso).getTime();
}

export const run = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Get the owner (already exists from /setup)
    const owner = await ctx.db
      .query("staff")
      .filter((q) => q.eq(q.field("role"), "Owner"))
      .first();
    if (!owner) throw new Error("Run /setup first to create the owner.");

    const staffId = owner._id;
    const now = Date.now();


    // ═══════════════════════════════════════════════════════════════════════
    // CLIENTS (12 total — some shared across projects)
    // ═══════════════════════════════════════════════════════════════════════

    const c1 = await ctx.db.insert("clients", {
      name: "James Mwangi", email: "james.mwangi@gmail.com", phone: "+254 712 345 678",
      type: "Individual", createdAt: d("2026-01-15"), updatedAt: d("2026-01-15"), createdBy: staffId,
    });
    const c2 = await ctx.db.insert("clients", {
      name: "Diana Wanjiku", email: "diana.w@outlook.com", phone: "+254 723 456 789",
      type: "Individual", createdAt: d("2026-01-15"), updatedAt: d("2026-01-15"), createdBy: staffId,
    });
    const c3 = await ctx.db.insert("clients", {
      name: "Peter Otieno", phone: "+254 700 111 222",
      type: "Individual", createdAt: d("2026-02-03"), updatedAt: d("2026-02-03"), createdBy: staffId,
    });
    const c4 = await ctx.db.insert("clients", {
      name: "Amani Holdings Ltd", email: "procurement@amaniholdings.co.ke", phone: "+254 20 271 3000",
      type: "Corporate", createdAt: d("2026-02-10"), updatedAt: d("2026-02-10"), createdBy: staffId,
    });
    const c5 = await ctx.db.insert("clients", {
      name: "Grace Nyambura", email: "grace.nyambura@yahoo.com", phone: "+254 710 987 654",
      type: "WeddingHost", createdAt: d("2026-03-01"), updatedAt: d("2026-03-01"), createdBy: staffId,
    });
    const c6 = await ctx.db.insert("clients", {
      name: "Samuel Kipchoge", phone: "+254 722 333 444",
      type: "Individual", createdAt: d("2026-03-10"), updatedAt: d("2026-03-10"), createdBy: staffId,
    });
    const c7 = await ctx.db.insert("clients", {
      name: "Wangari Maathai Foundation", email: "events@wangari.org", phone: "+254 20 555 6000",
      type: "EventOrganizer", createdAt: d("2026-03-20"), updatedAt: d("2026-03-20"), createdBy: staffId,
    });
    const c8 = await ctx.db.insert("clients", {
      name: "Dr. Aisha Mohammed", email: "aisha.m@knh.or.ke", phone: "+254 733 222 111",
      type: "Individual", createdAt: d("2026-04-05"), updatedAt: d("2026-04-05"), createdBy: staffId,
    });
    const c9 = await ctx.db.insert("clients", {
      name: "Kevin Ochieng", phone: "+254 711 444 555",
      type: "Individual", createdAt: d("2026-04-15"), updatedAt: d("2026-04-15"), createdBy: staffId,
    });
    const c10 = await ctx.db.insert("clients", {
      name: "Safaricom PLC", email: "corporate.events@safaricom.co.ke", phone: "+254 722 000 000",
      type: "Corporate", createdAt: d("2026-05-01"), updatedAt: d("2026-05-01"), createdBy: staffId,
    });
    const c11 = await ctx.db.insert("clients", {
      name: "Michael Kamau", phone: "+254 700 888 999",
      type: "Individual", createdAt: d("2026-05-10"), updatedAt: d("2026-05-10"), createdBy: staffId,
    });
    const c12 = await ctx.db.insert("clients", {
      name: "Njeri Kariuki", email: "njeri.k@gmail.com", phone: "+254 726 777 888",
      type: "Family", createdAt: d("2026-05-20"), updatedAt: d("2026-05-20"), createdBy: staffId,
    });


    // ═══════════════════════════════════════════════════════════════════════
    // PROJECT 1: Wedding — James & Diana (COMPLETED — full journey)
    // ═══════════════════════════════════════════════════════════════════════

    const p1 = await ctx.db.insert("projects", {
      slug: "wedding-james-and-diana-f8a2",
      title: "Wedding - James & Diana",
      primaryClientId: c1,
      type: "Wedding",
      status: "Completed",
      notes: "Full wedding party: groom, bride's brother (best man), two groomsmen. December 2026 wedding at Windsor Golf Hotel.",
      createdAt: d("2026-01-20"), updatedAt: d("2026-07-15"), createdBy: staffId,
    });

    // Participants
    const p1_groom = await ctx.db.insert("participants", {
      projectId: p1, clientId: c1, role: "Groom", createdAt: d("2026-01-20"),
    });
    const p1_bestman = await ctx.db.insert("participants", {
      projectId: p1, clientId: c3, role: "Best Man", createdAt: d("2026-01-22"),
    });

    // Consultation
    const p1_consult = await ctx.db.insert("consultations", {
      projectId: p1, conductedBy: staffId,
      requirements: "Three-piece morning suit for the groom in charcoal grey. Best man in matching waistcoat and trousers. Timeline is tight — wedding in 5 months.",
      styleNotes: "Classic British morning suit silhouette. Peak lapels. Double-breasted waistcoat. No tails — modern interpretation.",
      budget: 45000000, // KES 450,000
      timeline: "December 14, 2026",
      references: ["Tom Ford grey morning suit SS25", "Huntsman Savile Row lookbook"],
      completedAt: d("2026-01-25"),
      createdAt: d("2026-01-20"),
    });

    // Design
    const p1_design = await ctx.db.insert("designs", {
      consultationId: p1_consult, projectId: p1,
      style: "Three-piece morning suit — modern cut, no tails",
      fabric: "Dormeuil Amadeus 365 — charcoal grey Super 150s",
      color: "Charcoal grey with subtle chalk stripe",
      accessories: "Ivory silk tie, matching pocket square, mother-of-pearl cufflinks",
      references: ["dormeuil.com/amadeus-365", "pinterest.com/pin/morning-suit-ref"],
      notes: "Waistcoat to be double-breasted, 6 buttons. Trousers with single pleat.",
      approvedAt: d("2026-02-05"),
      createdAt: d("2026-01-28"), createdBy: staffId,
    });

    // Quotation (Accepted)
    await ctx.db.insert("quotations", {
      designId: p1_design, projectId: p1,
      items: [
        { id: "q1-1", description: "Groom morning suit (jacket, waistcoat, trousers)", quantity: 1, unitPrice: 18000000 },
        { id: "q1-2", description: "Best man two-piece (waistcoat, trousers)", quantity: 1, unitPrice: 12000000 },
        { id: "q1-3", description: "Accessories package (ties, squares, cufflinks)", quantity: 2, unitPrice: 2500000 },
      ],
      depositAmount: 15000000,
      validUntil: d("2026-03-15"),
      status: "Accepted", sentAt: d("2026-02-08"), acceptedAt: d("2026-02-10"),
      createdAt: d("2026-02-07"), createdBy: staffId,
    });

    // Payments — deposit + balance
    await ctx.db.insert("payments", {
      projectId: p1, type: "Deposit", status: "Paid", amount: 15000000,
      recordedBy: staffId, paidAt: d("2026-02-12"), createdAt: d("2026-02-12"),
    });
    await ctx.db.insert("payments", {
      projectId: p1, type: "Balance", status: "Paid", amount: 20000000,
      recordedBy: staffId, paidAt: d("2026-07-10"), createdAt: d("2026-07-10"),
    });


    // Measurements — groom (2 versions) + best man
    const p1_m1 = await ctx.db.insert("measurements", {
      participantId: p1_groom, version: 1,
      chest: 102, waist: 86, hips: 98, height: 180, inseam: 82, shoulder: 46, sleeve: 64, neck: 40, weight: 78,
      notes: "Athletic build, broad shoulders. Allow 2cm ease in chest.",
      takenBy: staffId, takenAt: d("2026-02-20"),
    });
    await ctx.db.insert("measurements", {
      participantId: p1_groom, version: 2,
      chest: 101, waist: 85, hips: 98, height: 180, inseam: 82, shoulder: 46, sleeve: 64, neck: 40, weight: 77,
      notes: "Lost slight weight. Adjusted waist down 1cm.",
      takenBy: staffId, takenAt: d("2026-05-15"),
    });
    const p1_m2 = await ctx.db.insert("measurements", {
      participantId: p1_bestman, version: 1,
      chest: 96, waist: 82, hips: 94, height: 175, inseam: 78, shoulder: 44, sleeve: 62, neck: 38, weight: 72,
      notes: "Standard build. Good posture.",
      takenBy: staffId, takenAt: d("2026-02-22"),
    });

    // Garments — all delivered
    const p1_g1 = await ctx.db.insert("garments", {
      participantId: p1_groom, projectId: p1, type: "Morning suit (3-piece)",
      status: "Delivered", measurementId: p1_m1, createdAt: d("2026-03-01"), createdBy: staffId,
    });
    const p1_g2 = await ctx.db.insert("garments", {
      participantId: p1_bestman, projectId: p1, type: "Two-piece (waistcoat + trousers)",
      status: "Delivered", measurementId: p1_m2, createdAt: d("2026-03-01"), createdBy: staffId,
    });

    // Production — completed stages
    for (const stage of ["DesignApproved", "FabricReady", "Pattern", "Cutting", "Stitching", "Finishing", "Pressing", "QualityCheck", "Ready"] as const) {
      await ctx.db.insert("productionRecords", {
        garmentId: p1_g1, stage, updatedBy: staffId, updatedAt: d("2026-03-15"),
      });
      await ctx.db.insert("productionRecords", {
        garmentId: p1_g2, stage, updatedBy: staffId, updatedAt: d("2026-03-18"),
      });
    }

    // Appointments
    await ctx.db.insert("appointments", {
      projectId: p1, type: "Consultation", status: "Completed", staffId, participantIds: [p1_groom],
      scheduledAt: d("2026-01-20"), durationMinutes: 90, isHomeVisit: false, createdAt: d("2026-01-18"),
    });
    await ctx.db.insert("appointments", {
      projectId: p1, type: "Measurement", status: "Completed", staffId, participantIds: [p1_groom, p1_bestman],
      scheduledAt: d("2026-02-20"), durationMinutes: 60, isHomeVisit: false, createdAt: d("2026-02-15"),
    });
    await ctx.db.insert("appointments", {
      projectId: p1, type: "Fitting", status: "Completed", staffId, participantIds: [p1_groom],
      scheduledAt: d("2026-05-15"), durationMinutes: 45, isHomeVisit: false,
      notes: "First fitting — check shoulder line and chest drape.", createdAt: d("2026-05-10"),
    });
    await ctx.db.insert("appointments", {
      projectId: p1, type: "Fitting", status: "Completed", staffId, participantIds: [p1_groom, p1_bestman],
      scheduledAt: d("2026-06-20"), durationMinutes: 60, isHomeVisit: false,
      notes: "Final fitting — all adjustments applied. Both pieces ready.", createdAt: d("2026-06-15"),
    });
    await ctx.db.insert("appointments", {
      projectId: p1, type: "Pickup", status: "Completed", staffId, participantIds: [p1_groom],
      scheduledAt: d("2026-07-12"), durationMinutes: 30, isHomeVisit: false, createdAt: d("2026-07-08"),
    });

    // Timeline
    for (const [type, summary, at] of [
      ["Project Created", "Commission opened for James Mwangi wedding party.", "2026-01-20"],
      ["Consultation Completed", "Requirements gathered. Morning suit direction confirmed.", "2026-01-25"],
      ["Design Approved", "Charcoal Dormeuil Amadeus 365 morning suit approved.", "2026-02-05"],
      ["Quotation Sent", "Quotation for KES 350,000 sent to client.", "2026-02-08"],
      ["Quotation Accepted", "Client accepted the quotation.", "2026-02-10"],
      ["Payment Received", "Deposit of KES 150,000 received.", "2026-02-12"],
      ["Measurements Taken", "Groom measured — v1. Athletic build noted.", "2026-02-20"],
      ["Measurements Taken", "Best man measured — v1.", "2026-02-22"],
      ["Garment Created", "Morning suit (3-piece) added to production.", "2026-03-01"],
      ["Garment Created", "Two-piece (waistcoat + trousers) for best man.", "2026-03-01"],
      ["Production Stage Updated", "Both garments through all 9 stages.", "2026-06-25"],
      ["Fitting Completed", "Final fitting — perfect fit, no further adjustments.", "2026-06-20"],
      ["Payment Received", "Balance of KES 200,000 received.", "2026-07-10"],
      ["Garment Status Updated", "All garments delivered.", "2026-07-12"],
    ] as const) {
      await ctx.db.insert("timelineEvents", {
        projectId: p1, type, summary, metadata: {}, createdBy: staffId, createdAt: d(at),
      });
    }

    // Story updates (past — already expired)
    await ctx.db.insert("storyUpdates", {
      projectId: p1, text: "Fabric has arrived from Dormeuil — stunning charcoal grey with the subtlest chalk stripe. Cutting begins tomorrow.",
      mediaUrls: [], publishedAt: d("2026-03-10"), expiresAt: d("2026-03-11"), movedToTimelineAt: d("2026-03-11"), createdBy: staffId,
    });
    await ctx.db.insert("storyUpdates", {
      projectId: p1, text: "Jacket taking shape beautifully. The peak lapels give it that commanding presence.",
      mediaUrls: [], publishedAt: d("2026-04-20"), expiresAt: d("2026-04-21"), movedToTimelineAt: d("2026-04-21"), createdBy: staffId,
    });


    // ═══════════════════════════════════════════════════════════════════════
    // PROJECT 2: Corporate — Amani Holdings (ACTIVE — in production)
    // ═══════════════════════════════════════════════════════════════════════

    const p2 = await ctx.db.insert("projects", {
      slug: "corporate-amani-holdings-b4c7",
      title: "Corporate - Amani Holdings",
      primaryClientId: c4,
      type: "Corporate",
      status: "Active",
      notes: "Executive team uniforms for 3 C-suite members. Annual general meeting presentation. Navy with gold accents matching brand guidelines.",
      createdAt: d("2026-02-15"), updatedAt: d("2026-07-20"), createdBy: staffId,
    });

    const p2_ceo = await ctx.db.insert("participants", {
      projectId: p2, clientId: c4, role: "CEO", createdAt: d("2026-02-15"),
    });
    const p2_cfo = await ctx.db.insert("participants", {
      projectId: p2, clientId: c9, role: "CFO", createdAt: d("2026-02-15"),
    });
    const p2_coo = await ctx.db.insert("participants", {
      projectId: p2, clientId: c11, role: "COO", createdAt: d("2026-02-15"),
    });

    await ctx.db.insert("consultations", {
      projectId: p2, conductedBy: staffId,
      requirements: "Three matching navy two-piece suits for the executive team. Must project authority while remaining approachable. Company AGM in September.",
      styleNotes: "Conservative silhouette. Notch lapels. Two-button. Slim but not tight. Gold-tone buttons as a nod to the Amani brand.",
      budget: 60000000,
      timeline: "September 5, 2026",
      references: ["Amani Holdings brand guidelines PDF", "Zegna corporate suiting collection"],
      completedAt: d("2026-02-20"),
      createdAt: d("2026-02-15"),
    });

    const p2_design = await ctx.db.insert("designs", {
      consultationId: (await ctx.db.query("consultations").withIndex("by_project", q => q.eq("projectId", p2)).first())!._id,
      projectId: p2,
      style: "Two-piece executive suit — notch lapel, two-button, slim",
      fabric: "Loro Piana Four Seasons — navy Super 130s",
      color: "Deep navy with micro herringbone texture",
      accessories: "Gold-tone blazer buttons, Amani Holdings monogram on inner lining",
      references: ["loropiana.com/four-seasons"],
      notes: "All three suits from the same bolt to ensure perfect colour match.",
      approvedAt: d("2026-03-01"),
      createdAt: d("2026-02-25"), createdBy: staffId,
    });

    await ctx.db.insert("quotations", {
      designId: p2_design, projectId: p2,
      items: [
        { id: "q2-1", description: "Executive two-piece suit (Loro Piana)", quantity: 3, unitPrice: 15000000 },
        { id: "q2-2", description: "Custom gold-tone buttons (per suit)", quantity: 3, unitPrice: 500000 },
        { id: "q2-3", description: "Monogrammed lining (per suit)", quantity: 3, unitPrice: 300000 },
      ],
      depositAmount: 20000000,
      validUntil: d("2026-04-01"),
      status: "Accepted", sentAt: d("2026-03-03"), acceptedAt: d("2026-03-05"),
      createdAt: d("2026-03-02"), createdBy: staffId,
    });

    await ctx.db.insert("payments", {
      projectId: p2, type: "Deposit", status: "Paid", amount: 20000000,
      recordedBy: staffId, paidAt: d("2026-03-08"), createdAt: d("2026-03-08"),
    });
    await ctx.db.insert("payments", {
      projectId: p2, type: "Installment", status: "Paid", amount: 15000000,
      recordedBy: staffId, paidAt: d("2026-05-20"), createdAt: d("2026-05-20"),
    });

    // Measurements for all 3 execs
    const p2_m1 = await ctx.db.insert("measurements", {
      participantId: p2_ceo, version: 1,
      chest: 108, waist: 94, hips: 102, height: 183, inseam: 84, shoulder: 48, sleeve: 66, neck: 42, weight: 88,
      notes: "Prominent belly — extra allowance in waist.", takenBy: staffId, takenAt: d("2026-03-15"),
    });
    const p2_m2 = await ctx.db.insert("measurements", {
      participantId: p2_cfo, version: 1,
      chest: 98, waist: 84, hips: 96, height: 176, inseam: 80, shoulder: 44, sleeve: 63, neck: 39,
      takenBy: staffId, takenAt: d("2026-03-15"),
    });
    const p2_m3 = await ctx.db.insert("measurements", {
      participantId: p2_coo, version: 1,
      chest: 104, waist: 90, hips: 100, height: 179, inseam: 81, shoulder: 46, sleeve: 65, neck: 41, weight: 82,
      takenBy: staffId, takenAt: d("2026-03-16"),
    });

    // Garments — in production
    const p2_g1 = await ctx.db.insert("garments", {
      participantId: p2_ceo, projectId: p2, type: "Navy executive suit (CEO)",
      status: "InProduction", measurementId: p2_m1, createdAt: d("2026-04-01"), createdBy: staffId,
    });
    const p2_g2 = await ctx.db.insert("garments", {
      participantId: p2_cfo, projectId: p2, type: "Navy executive suit (CFO)",
      status: "InProduction", measurementId: p2_m2, createdAt: d("2026-04-01"), createdBy: staffId,
    });
    const p2_g3 = await ctx.db.insert("garments", {
      participantId: p2_coo, projectId: p2, type: "Navy executive suit (COO)",
      status: "ReadyForFitting", measurementId: p2_m3, createdAt: d("2026-04-01"), createdBy: staffId,
    });

    // Production stages — CEO and CFO at Stitching, COO at Pressing
    for (const stage of ["DesignApproved", "FabricReady", "Pattern", "Cutting", "Stitching"] as const) {
      await ctx.db.insert("productionRecords", { garmentId: p2_g1, stage, updatedBy: staffId, updatedAt: d("2026-06-10") });
      await ctx.db.insert("productionRecords", { garmentId: p2_g2, stage, updatedBy: staffId, updatedAt: d("2026-06-12") });
    }
    for (const stage of ["DesignApproved", "FabricReady", "Pattern", "Cutting", "Stitching", "Finishing", "Pressing"] as const) {
      await ctx.db.insert("productionRecords", { garmentId: p2_g3, stage, updatedBy: staffId, updatedAt: d("2026-07-01") });
    }

    // Appointments
    await ctx.db.insert("appointments", {
      projectId: p2, type: "Measurement", status: "Completed", staffId,
      participantIds: [p2_ceo, p2_cfo, p2_coo],
      scheduledAt: d("2026-03-15"), durationMinutes: 90, isHomeVisit: true,
      notes: "Home visit to Amani Holdings HQ, Westlands. All three execs measured in the boardroom.",
      createdAt: d("2026-03-10"),
    });
    await ctx.db.insert("appointments", {
      projectId: p2, type: "Fitting", status: "Scheduled", staffId,
      participantIds: [p2_ceo, p2_cfo, p2_coo],
      scheduledAt: d("2026-08-10"), durationMinutes: 90, isHomeVisit: true,
      notes: "First fitting — all three at Amani HQ.", createdAt: d("2026-07-20"),
    });

    // Timeline
    for (const [type, summary, at] of [
      ["Project Created", "Corporate commission for Amani Holdings executive team.", "2026-02-15"],
      ["Participant Added", "CEO added.", "2026-02-15"],
      ["Participant Added", "CFO (Kevin Ochieng) added.", "2026-02-15"],
      ["Participant Added", "COO (Michael Kamau) added.", "2026-02-15"],
      ["Consultation Completed", "Requirements confirmed — navy suits, gold buttons, brand alignment.", "2026-02-20"],
      ["Design Approved", "Loro Piana Four Seasons fabric approved.", "2026-03-01"],
      ["Quotation Accepted", "KES 474,000 quotation accepted.", "2026-03-05"],
      ["Payment Received", "Deposit of KES 200,000 received.", "2026-03-08"],
      ["Measurements Taken", "All three executives measured at Amani HQ.", "2026-03-15"],
      ["Payment Received", "Installment of KES 150,000 received.", "2026-05-20"],
      ["Production Stage Updated", "CEO and CFO suits at Stitching. COO suit at Pressing.", "2026-07-01"],
    ] as const) {
      await ctx.db.insert("timelineEvents", { projectId: p2, type, summary, metadata: {}, createdBy: staffId, createdAt: d(at) });
    }

    await ctx.db.insert("storyUpdates", {
      projectId: p2, text: "The Loro Piana Four Seasons bolt arrived — all three suits will be cut from it tomorrow to guarantee a perfect colour match across the team.",
      mediaUrls: [], publishedAt: d("2026-04-05"), expiresAt: d("2026-04-06"), movedToTimelineAt: d("2026-04-06"), createdBy: staffId,
    });


    // ═══════════════════════════════════════════════════════════════════════
    // PROJECT 3: Individual — Grace Nyambura Gala Outfit (ACTIVE — design)
    // ═══════════════════════════════════════════════════════════════════════

    const p3 = await ctx.db.insert("projects", {
      slug: "gala-outfit-grace-nyambura-e1d3",
      title: "Gala Outfit - Grace Nyambura",
      primaryClientId: c5,
      type: "GalaOutfit",
      status: "Active",
      notes: "Floor-length evening gown for the Kenya Red Cross Charity Gala, October 2026. Client wants to make a statement — burgundy silk with gold beading.",
      createdAt: d("2026-03-05"), updatedAt: d("2026-07-25"), createdBy: staffId,
    });

    const p3_grace = await ctx.db.insert("participants", {
      projectId: p3, clientId: c5, role: "Client", createdAt: d("2026-03-05"),
    });

    await ctx.db.insert("consultations", {
      projectId: p3, conductedBy: staffId,
      requirements: "Floor-length evening gown. Must photograph well from every angle. Red carpet event — will be photographed extensively.",
      styleNotes: "Deep V neckline. Fitted bodice transitioning to a flowing A-line skirt. Burgundy base with gold beadwork on the bodice. Train optional but client is open.",
      budget: 35000000,
      timeline: "October 12, 2026",
      references: ["Elie Saab Haute Couture FW25", "Naeem Khan beaded gowns"],
      completedAt: d("2026-03-12"),
      createdAt: d("2026-03-05"),
    });

    await ctx.db.insert("designs", {
      consultationId: (await ctx.db.query("consultations").withIndex("by_project", q => q.eq("projectId", p3)).first())!._id,
      projectId: p3,
      style: "Floor-length A-line gown with beaded bodice and 1m train",
      fabric: "Italian silk duchess satin — deep burgundy",
      color: "Burgundy (#4B1E2A) with antique gold beadwork",
      accessories: "Gold clutch, statement earrings (client's own), custom silk wrap for the evening chill",
      references: ["pinterest.com/pin/burgundy-gala-gown", "eliesaab.com/fw25-look-42"],
      notes: "Beadwork pattern to be finalized after toile fitting. Client wants a celestial/constellation motif.",
      createdAt: d("2026-03-18"), createdBy: staffId,
    });

    await ctx.db.insert("measurements", {
      participantId: p3_grace, version: 1,
      chest: 88, waist: 68, hips: 96, height: 170, inseam: 78, shoulder: 38, sleeve: 58, neck: 34, weight: 62,
      notes: "Petite frame, long torso. Bodice length needs extra attention.",
      takenBy: staffId, takenAt: d("2026-03-20"),
    });

    await ctx.db.insert("appointments", {
      projectId: p3, type: "Fitting", status: "Scheduled", staffId, participantIds: [p3_grace],
      scheduledAt: d("2026-08-15"), durationMinutes: 90, isHomeVisit: false,
      notes: "Toile fitting — test the silhouette and bodice construction before cutting the silk.", createdAt: d("2026-07-25"),
    });

    for (const [type, summary, at] of [
      ["Project Created", "Gala outfit commission for Grace Nyambura — Kenya Red Cross Charity Gala.", "2026-03-05"],
      ["Consultation Completed", "Evening gown direction confirmed. Burgundy silk, gold beading, celestial motif.", "2026-03-12"],
      ["Measurements Taken", "Grace measured. Petite frame, long torso noted.", "2026-03-20"],
    ] as const) {
      await ctx.db.insert("timelineEvents", { projectId: p3, type, summary, metadata: {}, createdBy: staffId, createdAt: d(at) });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PROJECT 4: Individual — Samuel Kipchoge (ACTIVE — quotation sent)
    // ═══════════════════════════════════════════════════════════════════════

    const p4 = await ctx.db.insert("projects", {
      slug: "individual-samuel-kipchoge-7f9a",
      title: "Individual - Samuel Kipchoge",
      primaryClientId: c6,
      type: "Individual",
      status: "Active",
      notes: "Classic navy blue double-breasted blazer with brass buttons. Weekend wear — slightly relaxed cut. Client is a long-distance runner; lean, muscular build.",
      createdAt: d("2026-03-15"), updatedAt: d("2026-07-10"), createdBy: staffId,
    });

    const p4_sam = await ctx.db.insert("participants", {
      projectId: p4, clientId: c6, role: "Client", createdAt: d("2026-03-15"),
    });

    await ctx.db.insert("consultations", {
      projectId: p4, conductedBy: staffId,
      requirements: "Double-breasted blazer for weekend social events. Nothing too formal. Should work with chinos and dark denim alike.",
      styleNotes: "6-on-2 button stance. Slightly longer length. Patch pockets for the casual feel. Unstructured shoulders for comfort.",
      budget: 12000000,
      timeline: "End of August 2026",
      references: ["Brunello Cucinelli unstructured blazers", "Ring Jacket Napoli"],
      completedAt: d("2026-03-18"),
      createdAt: d("2026-03-15"),
    });

    const p4_design = await ctx.db.insert("designs", {
      consultationId: (await ctx.db.query("consultations").withIndex("by_project", q => q.eq("projectId", p4)).first())!._id,
      projectId: p4,
      style: "Unstructured double-breasted blazer — 6×2, patch pockets",
      fabric: "Holland & Sherry Crispaire — navy hopsack",
      color: "Navy blue",
      accessories: "Brass military-style buttons, pick-stitched lapels in tonal navy",
      references: ["hollandsherry.com/crispaire"],
      approvedAt: d("2026-04-01"),
      createdAt: d("2026-03-25"), createdBy: staffId,
    });

    await ctx.db.insert("quotations", {
      designId: p4_design, projectId: p4,
      items: [
        { id: "q4-1", description: "Unstructured DB blazer (Holland & Sherry hopsack)", quantity: 1, unitPrice: 9500000 },
        { id: "q4-2", description: "Brass buttons set + pick-stitching", quantity: 1, unitPrice: 800000 },
      ],
      depositAmount: 5000000,
      validUntil: d("2026-05-01"),
      status: "Sent", sentAt: d("2026-04-05"),
      createdAt: d("2026-04-03"), createdBy: staffId,
    });

    await ctx.db.insert("measurements", {
      participantId: p4_sam, version: 1,
      chest: 94, waist: 74, hips: 90, height: 178, inseam: 84, shoulder: 44, sleeve: 64, neck: 37, weight: 65,
      notes: "Very lean build — runner's physique. Minimal chest-waist differential. Shoulders narrow for height.",
      takenBy: staffId, takenAt: d("2026-04-10"),
    });

    for (const [type, summary, at] of [
      ["Project Created", "Commission for Samuel Kipchoge — unstructured navy blazer.", "2026-03-15"],
      ["Consultation Completed", "Weekend blazer direction confirmed. Unstructured, 6×2, patch pockets.", "2026-03-18"],
      ["Design Approved", "Holland & Sherry Crispaire navy hopsack approved.", "2026-04-01"],
      ["Quotation Sent", "Quotation for KES 103,000 sent. Awaiting response.", "2026-04-05"],
      ["Measurements Taken", "Samuel measured. Runner's physique noted.", "2026-04-10"],
    ] as const) {
      await ctx.db.insert("timelineEvents", { projectId: p4, type, summary, metadata: {}, createdBy: staffId, createdAt: d(at) });
    }


    // ═══════════════════════════════════════════════════════════════════════
    // PROJECT 5: Photoshoot — Wangari Foundation (ACTIVE — measurements)
    // ═══════════════════════════════════════════════════════════════════════

    const p5 = await ctx.db.insert("projects", {
      slug: "photoshoot-wangari-foundation-c2e5",
      title: "Photoshoot - Wangari Maathai Foundation",
      primaryClientId: c7,
      type: "Photoshoot",
      status: "Active",
      notes: "5 tailored pieces for the Foundation's 2027 calendar photoshoot. Styled on 3 models. Earth-tone palette reflecting the environmental mission.",
      createdAt: d("2026-04-01"), updatedAt: d("2026-07-28"), createdBy: staffId,
    });

    const p5_model1 = await ctx.db.insert("participants", { projectId: p5, clientId: c8, role: "Model 1", createdAt: d("2026-04-01") });
    const p5_model2 = await ctx.db.insert("participants", { projectId: p5, clientId: c12, role: "Model 2", createdAt: d("2026-04-01") });

    await ctx.db.insert("consultations", {
      projectId: p5, conductedBy: staffId,
      requirements: "5 editorial pieces across 3 models. Earthy colours — olive, terracotta, sand. Modern tailoring meets sustainable fashion narrative.",
      styleNotes: "Oversized blazers, wide-leg trousers, structured waistcoats. Gender-neutral cuts. Visible topstitching for a craft-forward look.",
      budget: 50000000,
      timeline: "November 2026 shoot dates",
      references: ["Stella McCartney sustainability collection", "The Row AW25"],
      completedAt: d("2026-04-10"),
      createdAt: d("2026-04-01"),
    });

    for (const [type, summary, at] of [
      ["Project Created", "Editorial photoshoot commission for Wangari Foundation 2027 calendar.", "2026-04-01"],
      ["Consultation Completed", "Earth-tone editorial direction confirmed. 5 pieces, 3 models.", "2026-04-10"],
    ] as const) {
      await ctx.db.insert("timelineEvents", { projectId: p5, type, summary, metadata: {}, createdBy: staffId, createdAt: d(at) });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PROJECT 6: Alteration — Dr. Aisha Mohammed (COMPLETED — quick job)
    // ═══════════════════════════════════════════════════════════════════════

    const p6 = await ctx.db.insert("projects", {
      slug: "alteration-dr-aisha-mohammed-a5b8",
      title: "Alteration - Dr. Aisha Mohammed",
      primaryClientId: c8,
      type: "Alteration",
      status: "Completed",
      notes: "Take in the waist on a Chanel-style tweed jacket (client's own). Shorten sleeves by 2cm. Needed before a medical conference in Mombasa.",
      createdAt: d("2026-04-08"), updatedAt: d("2026-04-22"), createdBy: staffId,
    });

    const p6_aisha = await ctx.db.insert("participants", { projectId: p6, clientId: c8, role: "Client", createdAt: d("2026-04-08") });

    await ctx.db.insert("consultations", {
      projectId: p6, conductedBy: staffId,
      requirements: "Waist taken in 3cm on a tweed bouclé jacket. Sleeves shortened 2cm. Minimal intervention — preserve the original construction.",
      budget: 800000,
      timeline: "April 20, 2026 — conference starts April 22",
      references: [],
      completedAt: d("2026-04-08"),
      createdAt: d("2026-04-08"),
    });

    const p6_m = await ctx.db.insert("measurements", {
      participantId: p6_aisha, version: 1,
      chest: 90, waist: 72, hips: 98, height: 165, inseam: 74, shoulder: 40, sleeve: 56, neck: 35, weight: 60,
      takenBy: staffId, takenAt: d("2026-04-08"),
    });

    const p6_g = await ctx.db.insert("garments", {
      participantId: p6_aisha, projectId: p6, type: "Tweed jacket alteration",
      status: "Delivered", measurementId: p6_m, createdAt: d("2026-04-09"), createdBy: staffId,
    });

    await ctx.db.insert("payments", {
      projectId: p6, type: "Balance", status: "Paid", amount: 800000,
      recordedBy: staffId, paidAt: d("2026-04-20"), createdAt: d("2026-04-20"),
    });

    for (const [type, summary, at] of [
      ["Project Created", "Quick alteration — tweed jacket for Dr. Aisha.", "2026-04-08"],
      ["Consultation Completed", "Waist in 3cm, sleeves -2cm. Rush job for Mombasa conference.", "2026-04-08"],
      ["Measurements Taken", "Client measured for the alteration.", "2026-04-08"],
      ["Payment Received", "Full payment KES 8,000 received.", "2026-04-20"],
      ["Garment Status Updated", "Jacket delivered. Client confirmed perfect fit via WhatsApp.", "2026-04-20"],
    ] as const) {
      await ctx.db.insert("timelineEvents", { projectId: p6, type, summary, metadata: {}, createdBy: staffId, createdAt: d(at) });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PROJECT 7: Closet Revamp — Njeri Kariuki (ACTIVE — early stage)
    // ═══════════════════════════════════════════════════════════════════════

    const p7 = await ctx.db.insert("projects", {
      slug: "closet-revamp-njeri-kariuki-d9f1",
      title: "Closet Revamp - Njeri Kariuki",
      primaryClientId: c12,
      type: "ClosetRevamp",
      status: "Active",
      notes: "Full professional wardrobe rebuild — 4 suits, 6 shirts, 2 casual blazers. Njeri is transitioning from corporate law to a tech CEO role and wants to modernize.",
      createdAt: d("2026-05-22"), updatedAt: d("2026-07-28"), createdBy: staffId,
    });

    const p7_njeri = await ctx.db.insert("participants", { projectId: p7, clientId: c12, role: "Client", createdAt: d("2026-05-22") });

    await ctx.db.insert("consultations", {
      projectId: p7, conductedBy: staffId,
      requirements: "Complete wardrobe overhaul. 12 pieces total. Needs to look sharp at board meetings but also approachable at startup events. Mix of formal and smart-casual.",
      styleNotes: "Structured but not stiff. Modern proportions. Mix navy, charcoal, and lighter tones. Some pattern — windowpane, herringbone. Everything mixable.",
      budget: 120000000,
      timeline: "Phased delivery: first 4 pieces by August, remainder by October",
      references: ["capsule wardrobe principles", "The Sartorialist editorial"],
      completedAt: d("2026-05-28"),
      createdAt: d("2026-05-22"),
    });

    for (const [type, summary, at] of [
      ["Project Created", "Full closet revamp — 12 pieces for Njeri's CEO transition.", "2026-05-22"],
      ["Consultation Completed", "Direction set: structured but modern, mixable, navy-charcoal-tan palette.", "2026-05-28"],
    ] as const) {
      await ctx.db.insert("timelineEvents", { projectId: p7, type, summary, metadata: {}, createdBy: staffId, createdAt: d(at) });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PROJECT 8: Corporate — Safaricom (DRAFT — just opened)
    // ═══════════════════════════════════════════════════════════════════════

    const p8 = await ctx.db.insert("projects", {
      slug: "corporate-safaricom-plc-8b2c",
      title: "Corporate - Safaricom PLC",
      primaryClientId: c10,
      type: "Corporate",
      status: "Draft",
      notes: "Initial enquiry from Safaricom corporate events team. Custom-tailored outfits for 10 hosts at their annual Ndoto Zetu awards ceremony. Green and silver colour scheme.",
      createdAt: d("2026-05-05"), updatedAt: d("2026-05-05"), createdBy: staffId,
    });

    await ctx.db.insert("timelineEvents", {
      projectId: p8, type: "Project Created",
      summary: "Enquiry from Safaricom — 10 host outfits for Ndoto Zetu awards. Draft stage.",
      metadata: {}, createdBy: staffId, createdAt: d("2026-05-05"),
    });

    // ═══════════════════════════════════════════════════════════════════════
    // PROJECT 9: Wedding — Kevin Ochieng solo (ON HOLD — client travel)
    // ═══════════════════════════════════════════════════════════════════════

    const p9 = await ctx.db.insert("projects", {
      slug: "individual-kevin-ochieng-3a7d",
      title: "Individual - Kevin Ochieng",
      primaryClientId: c9,
      type: "Individual",
      status: "OnHold",
      notes: "Single-breasted dinner jacket (tuxedo) in midnight blue. Client travelling for work until mid-August — project paused after measurements.",
      createdAt: d("2026-04-18"), updatedAt: d("2026-06-01"), createdBy: staffId,
    });

    const p9_kevin = await ctx.db.insert("participants", { projectId: p9, clientId: c9, role: "Client", createdAt: d("2026-04-18") });

    await ctx.db.insert("consultations", {
      projectId: p9, conductedBy: staffId,
      requirements: "Dinner jacket for black-tie events. Midnight blue, shawl collar, satin facings. One-button closure.",
      styleNotes: "Peak shawl collar. Jet-black satin facings. Slim fit, no break in trousers. Client admires Daniel Craig's Bond look.",
      budget: 18000000,
      timeline: "December 2026 (flexible due to travel)",
      references: ["Tom Ford Shelton dinner jacket", "007 Skyfall premiere look"],
      completedAt: d("2026-04-22"),
      createdAt: d("2026-04-18"),
    });

    await ctx.db.insert("measurements", {
      participantId: p9_kevin, version: 1,
      chest: 100, waist: 82, hips: 96, height: 182, inseam: 84, shoulder: 46, sleeve: 65, neck: 40, weight: 80,
      notes: "Well-proportioned athletic build. Slightly dropped left shoulder — add 0.5cm padding on left.",
      takenBy: staffId, takenAt: d("2026-04-25"),
    });

    for (const [type, summary, at] of [
      ["Project Created", "Dinner jacket commission for Kevin Ochieng.", "2026-04-18"],
      ["Consultation Completed", "Midnight blue tuxedo direction confirmed. Bond-inspired.", "2026-04-22"],
      ["Measurements Taken", "Kevin measured. Dropped left shoulder noted.", "2026-04-25"],
      ["Status Changed", "On hold — client travelling until mid-August.", "2026-06-01"],
    ] as const) {
      await ctx.db.insert("timelineEvents", { projectId: p9, type, summary, metadata: {}, createdBy: staffId, createdAt: d(at) });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PROJECT 10: Individual — Peter Otieno (ACTIVE — ready for delivery)
    // ═══════════════════════════════════════════════════════════════════════

    const p10 = await ctx.db.insert("projects", {
      slug: "individual-peter-otieno-6c4e",
      title: "Individual - Peter Otieno",
      primaryClientId: c3,
      type: "Individual",
      status: "Active",
      notes: "Linen safari jacket in khaki with matching trousers. For a photojournalism assignment in the Maasai Mara. Needs to be functional — bellows pockets, breathable, no lining.",
      createdAt: d("2026-02-05"), updatedAt: d("2026-07-30"), createdBy: staffId,
    });

    const p10_peter = await ctx.db.insert("participants", { projectId: p10, clientId: c3, role: "Client", createdAt: d("2026-02-05") });

    await ctx.db.insert("consultations", {
      projectId: p10, conductedBy: staffId,
      requirements: "Safari jacket + matching trousers. Must be highly functional: bellows pockets (chest and hip), action back pleat, half-belt at rear. Unlined for heat.",
      styleNotes: "Classic safari silhouette à la Hemingway. Relaxed fit for movement. Trousers with cargo pocket on right thigh.",
      budget: 8500000,
      timeline: "July 2026 — assignment starts August 5",
      references: ["Willis & Geiger original safari jacket", "Beretta sport safari"],
      completedAt: d("2026-02-10"),
      createdAt: d("2026-02-05"),
    });

    const p10_design = await ctx.db.insert("designs", {
      consultationId: (await ctx.db.query("consultations").withIndex("by_project", q => q.eq("projectId", p10)).first())!._id,
      projectId: p10,
      style: "Classic safari jacket with bellows pockets + matching cargo trousers",
      fabric: "Irish linen — khaki, 11oz weight",
      color: "Khaki / sand",
      accessories: "Horn buttons, leather elbow patches (removable), YKK brass zippers on pockets",
      references: ["willisandgeiger.com/heritage-safari"],
      notes: "Unlined. Action back pleat for arm movement. Half-belt at rear waist.",
      approvedAt: d("2026-02-18"),
      createdAt: d("2026-02-14"), createdBy: staffId,
    });

    await ctx.db.insert("quotations", {
      designId: p10_design, projectId: p10,
      items: [
        { id: "q10-1", description: "Safari jacket (Irish linen, unlined, bellows pockets)", quantity: 1, unitPrice: 5500000 },
        { id: "q10-2", description: "Matching cargo trousers", quantity: 1, unitPrice: 3000000 },
      ],
      depositAmount: 4000000, validUntil: d("2026-03-15"),
      status: "Accepted", sentAt: d("2026-02-20"), acceptedAt: d("2026-02-22"),
      createdAt: d("2026-02-19"), createdBy: staffId,
    });

    await ctx.db.insert("payments", {
      projectId: p10, type: "Deposit", status: "Paid", amount: 4000000,
      recordedBy: staffId, paidAt: d("2026-02-25"), createdAt: d("2026-02-25"),
    });
    await ctx.db.insert("payments", {
      projectId: p10, type: "Balance", status: "Paid", amount: 4500000,
      recordedBy: staffId, paidAt: d("2026-07-25"), createdAt: d("2026-07-25"),
    });

    const p10_m = await ctx.db.insert("measurements", {
      participantId: p10_peter, version: 1,
      chest: 100, waist: 88, hips: 98, height: 176, inseam: 80, shoulder: 45, sleeve: 63, neck: 40, weight: 79,
      notes: "Stocky build. Needs generous armhole for camera-lifting movement.",
      takenBy: staffId, takenAt: d("2026-03-01"),
    });

    const p10_g1 = await ctx.db.insert("garments", {
      participantId: p10_peter, projectId: p10, type: "Safari jacket",
      status: "ReadyForDelivery", measurementId: p10_m, createdAt: d("2026-03-10"), createdBy: staffId,
    });
    const p10_g2 = await ctx.db.insert("garments", {
      participantId: p10_peter, projectId: p10, type: "Cargo trousers",
      status: "ReadyForDelivery", measurementId: p10_m, createdAt: d("2026-03-10"), createdBy: staffId,
    });

    for (const stage of ["DesignApproved", "FabricReady", "Pattern", "Cutting", "Stitching", "Finishing", "Pressing", "QualityCheck", "Ready"] as const) {
      await ctx.db.insert("productionRecords", { garmentId: p10_g1, stage, updatedBy: staffId, updatedAt: d("2026-06-20") });
      await ctx.db.insert("productionRecords", { garmentId: p10_g2, stage, updatedBy: staffId, updatedAt: d("2026-06-22") });
    }

    await ctx.db.insert("appointments", {
      projectId: p10, type: "Pickup", status: "Scheduled", staffId, participantIds: [p10_peter],
      scheduledAt: d("2026-08-02"), durationMinutes: 20, isHomeVisit: false,
      notes: "Peter collecting before Mara assignment. Check pockets hold camera batteries.", createdAt: d("2026-07-28"),
    });

    for (const [type, summary, at] of [
      ["Project Created", "Safari outfit for Peter's photojournalism assignment.", "2026-02-05"],
      ["Consultation Completed", "Classic safari jacket direction. Bellows pockets, unlined, action back.", "2026-02-10"],
      ["Design Approved", "Irish linen, khaki, horn buttons confirmed.", "2026-02-18"],
      ["Quotation Accepted", "KES 85,000 quotation accepted.", "2026-02-22"],
      ["Payment Received", "Deposit of KES 40,000.", "2026-02-25"],
      ["Measurements Taken", "Peter measured. Generous armhole for camera work.", "2026-03-01"],
      ["Production Stage Updated", "Both garments through all stages. Ready for delivery.", "2026-06-22"],
      ["Payment Received", "Balance of KES 45,000.", "2026-07-25"],
      ["Appointment Scheduled", "Pickup booked for Aug 2 before Mara assignment.", "2026-07-28"],
    ] as const) {
      await ctx.db.insert("timelineEvents", { projectId: p10, type, summary, metadata: {}, createdBy: staffId, createdAt: d(at) });
    }

    await ctx.db.insert("storyUpdates", {
      projectId: p10,
      text: "Peter's safari jacket is complete — the linen has softened beautifully after pressing. Those bellows pockets will hold everything from lens caps to field notebooks.",
      mediaUrls: [], publishedAt: d("2026-07-01"), expiresAt: d("2026-07-02"), movedToTimelineAt: d("2026-07-02"), createdBy: staffId,
    });

    // ═══════════════════════════════════════════════════════════════════════
    console.log("✓ Seed complete — 10 commissions, 12 clients, full journeys.");
  },
});
